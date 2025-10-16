
const baseURL = 'http://localhost:3000'
const token = localStorage.getItem("token");


let globalProfile = {};
const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
};
const clientIo = io(baseURL, {
    auth: { 
        authorization: token 
    },
    transports: ['websocket', 'polling'] 
})

clientIo.on("connect", () => {
    console.log("✅ Socket connected successfully");
});

clientIo.on("connect_error", (error) => {
    console.log("❌ Socket connection error:", error);
});

clientIo.emit('say-hello',{message:"hello from FE"})

clientIo.on('connected', ({user})=>{
    globalProfile =user 
})

//images links
let avatar = './avatar/Avatar-No-Background.png'
let meImage = './avatar/Avatar-No-Background.png'
let friendImage = './avatar/Avatar-No-Background.png'


// collect messageInfo
function sendMessage(sendTo, type) {
    console.log("🚀 sendMessage:",sendTo,type);
    
    if (type == "ovo") {
        const data = {
            text: $("#messageBody").val(),
            targetUserId:sendTo,
        }
        clientIo.emit('send-private-message', data)
    } else if (type == "ovm") {        
        const data = {
            text: $("#messageBody").val(),
            targetGroupId: sendTo,
        }        
        clientIo.emit('send-group-message', data)
    }
}

//sendCompleted
clientIo.on('message-sent', (data) => {
    
    const { text , senderId } = data
    const div = document.createElement('div');

    div.className = 'me text-end p-2';

    if(senderId.toString()  == globalProfile._id)  div.dir = 'rtl';
    else  div.dir = 'ltr';

    const imagePath= avatar;
    div.innerHTML = `
        <img class="chatImage" src="${imagePath}" alt="" srcset="">
        <span class="mx-2">${text}</span>
    `;
    document.getElementById('messageList').appendChild(div);
    $(".noResult").hide()
    $("#messageBody").val('')

    const audio = document.getElementById("notifyTone");
    audio.currentTime = 0; // restart from beginning
    audio.play().catch(err => console.log("Audio play blocked:", err));
})

function renderMyMessage(text) {
    const div = document.createElement('div');
    div.className = 'me text-end p-2';
    div.dir = 'rtl';
    div.innerHTML = `
    <img class="chatImage" src="${meImage}" alt="" srcset="">
    <span class="mx-2">${text}</span>
    `;
    document.getElementById('messageList').appendChild(div);
}

function renderFriendMessage(text) {
    const div = document.createElement('div');
    div.className = 'myFriend p-2';
    div.dir = 'ltr';
    div.innerHTML = `
    <img class="chatImage" src="${friendImage}" alt="" srcset="">
    <span class="mx-2">${text}</span>
    `;
    document.getElementById('messageList').appendChild(div);
}

function SayHi(){
    const div = document.createElement('div');
    div.className = 'noResult text-center  p-2';
    div.dir = 'ltr';
    div.innerHTML = `
    <span class="mx-2">Say Hi to start the conversation.</span>
    `;
    document.getElementById('messageList').appendChild(div);
}


// Show Friends list  and groups list

let allUsers = {};

function getAllUsers() {
    axios({
        method: 'get',
        url: `${baseURL}/api/profile/list`,
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    }).then(function (response) {        
        response.data.data.forEach(user => {
            allUsers[user._id] = user;
        });
        
        getUserData();
    }).catch(function (error) {
        console.log("Error getting users:", error);
    });
}

// Show Friends list
function getUserData() {
    const token = localStorage.getItem("token");
    
    axios({
        method: 'get',
        url: `${baseURL}/api/profile/friends`,
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    }).then(function (response) {
        const friends = response.data.data;
        
        if (globalProfile && globalProfile._id) {
            const currentUser = allUsers[globalProfile._id];
            if (currentUser) {
                document.getElementById("userName").innerHTML = `${currentUser.firstName} ${currentUser.lastName}`;
            }
        }
        
        document.getElementById("profileImage").src = avatar;
        showUsersData(friends);
    }).catch(function (error) {
        console.log("❌ FRIENDS API Error:", error);
    });
}

//=========================================== PRIVATE CHAT ====================================//
// Show friends list
function showUsersData(friends = []) {
    let cartonna = ``
    for (let i = 0; i < friends.length; i++) {
        let friendId;
        
        // تحديد مين هو الصديق بناءً على الـ IDs
        if(globalProfile._id == friends[i].friendToId.toString()){
            friendId = friends[i].friendFromId;
        } else {
            friendId = friends[i].friendToId;
        }
        
        // نجيب بيانات الصديق من الـ allUsers
        const friend = allUsers[friendId];
        
        let imagePath = avatar;
        cartonna += `
        <div onclick="displayChatUser('${friendId}')" class="chatUser my-2">
            <img class="chatImage" src="${imagePath}" alt="" srcset="">
            <span class="ps-2">${friend ? friend.firstName + ' ' + friend.lastName : 'صديق ' + (i + 1)}</span>
            <span id="${"c_" + friendId}" class="ps-2 closeSpan">
               🟢
            </span>
        </div>
        `
    }
    document.getElementById('chatUsers').innerHTML = cartonna;
}
//  Show chat conversation when sending new message
function showData(sendTo, chat) {    
    document.getElementById("sendMessage").setAttribute("onclick", `sendMessage('${sendTo}' , "ovo")`);
    document.getElementById('messageList').innerHTML = ''
    if (chat?.length) {
        $(".noResult").hide()
        for (const message of chat) {

            if (message.senderId.toString() == globalProfile._id.toString()) {
                renderMyMessage(message.text, meImage)
            } else {
                renderFriendMessage(message.text, friendImage)
            }
        }
    } else {
        SayHi()
    }
    $(`#c_${sendTo}`).hide();
}

// get chat conversation between 2 users and pass it to ShowData fun
function displayChatUser(userId) {
    clientIo.emit('get-chat-history',userId )
    clientIo.on('chat-history', (chat)=>{
        if(chat.length) showData(userId, chat)
        else showData(userId, 0)
    })
}

//=========================================== GROUPS ====================================//

//getGroups
function getGroups() {
    axios({
        method: 'get',
        url: `${baseURL}/api/profile/groups`,
        headers
    }).then(function (response) {
        const groups = response.data.data;
        showGroupList(groups);
    }).catch(err => console.log("❌ GROUPS API Error:", err));
}



// Show groups list
function showGroupList(groups = []) {    
    let cartonna = ``
    for (let i = 0; i < groups.length; i++) {
        let imagePath = avatar;
        cartonna += `
        <div onclick="displayGroupChat('${groups[i]._id}')" class="chatUser my-2">
        <img class="chatImage" src="${imagePath}" alt="" srcset="">
        <span class="ps-2">${groups[i].name}</span>
           <span id="${"g_" + groups[i]._id}" class="ps-2 closeSpan">
        </span>
        </div>
        `
    }
    document.getElementById('chatGroups').innerHTML = cartonna;
}

// Show  group chat conversation history
function showGroupData(sendTo, chat) {    
    document.getElementById("sendMessage").setAttribute("onclick", `sendMessage('${sendTo}' , "ovm")`);

    document.getElementById('messageList').innerHTML = ''
    if (chat?.length) {
        $(".noResult").hide()
        for (const message of chat) {
            if (message.senderId.toString() == globalProfile._id.toString()) {
                renderMyMessage(message.text, meImage)
            } else {
                renderFriendMessage(message.text, friendImage)
            }
        }
    } else {
        SayHi()
    }
    $(`#g_${sendTo}`).hide();
}

// get group chat conversation between 2 users and pass it to ShowData fun
function displayGroupChat(groupId) {
    clientIo.emit("get-group-chat", groupId)
    clientIo.on("group-chat-history", (chat)=>{
        if(chat?.length){
            showGroupData(groupId, chat)
        }else{
            showGroupData(groupId, 0)
        }
    })
}

getAllUsers()
getGroups()





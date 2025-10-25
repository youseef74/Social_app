

export const pagiantion =({
    page=1,
    limit=10
})=>{
if(Number(page)<1) page = 1
if(Number(limit)<1) limit = 10

const skip = (page-1)*limit
return {page,limit,skip}
}
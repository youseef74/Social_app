import { GraphQLInt, GraphQLObjectType, GraphQLSchema, GraphQLString } from "graphql";
import { resolve } from 'path';


export const MainSchema = new GraphQLSchema({
    query:new GraphQLObjectType({
        name:"Query",
        description:"this is query",
        fields:{
            sayHello:{
                type:GraphQLString,
            resolve:()=>"hello world"
            },
            sayNumber:{
                type:GraphQLInt,
                resolve:()=>123456
            }
        }
    }),

    mutation: new GraphQLObjectType({
        name:"Mutation",
        description:"this is mutation",
        fields:{
            mutateHello:{
                type:GraphQLInt,
                resolve:()=>123456
            }
        }
    })
})
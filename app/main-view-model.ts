import observable = require("data/observable");
import http = require("http");
import privateData = require("./privateData");
import { Post } from "./post";
var applicationSettings = require("application-settings");

const indexKey = "postIndexKey";

export class HelloWorldModel extends observable.Observable {

    private _message: string;
    private postList: Array<Post>;

    get message(): string {
        return this._message;
    }
    set message(value: string) {
        if (this._message !== value) {
            this._message = value;
            this.notifyPropertyChange("message", value)
        }
    }

    constructor() {
        super();

        this.updateMessage("Nothing happened just yet");
        this.showPostList();
    }

    private updateMessage(notice: string) {
        this.message = notice;
    }

    private showPostList() {
        let indexData:string = applicationSettings.getString(indexKey);
        console.log(indexData);
        if (indexData) {
            let index:Array<string> = JSON.parse(indexData);
            this.postList = index.map((postKey) => {
                console.log(postKey);
                var postData = applicationSettings.getString(postKey);
                if (postData) {
                    console.log(postData);
                    let post:Post = Post.deserialise(postData);
                    return post;
                }
                return null;
            });
        }        
    }

    private removePostKey(postKey:string) {
        applicationSettings.remove(postKey);
        let indexData:string = applicationSettings.getString(indexKey, "[]");
        let index:Array<string> = JSON.parse(indexData);
        let arrayIndex:number = index.indexOf(postKey, 0);
        if (arrayIndex > -1) {
            index.splice(arrayIndex, 1);
            console.log("Removed " + postKey + " from index position " + arrayIndex);
        }
        applicationSettings.setString(indexKey, JSON.stringify(index));
        console.log("Index length " + index.length);
    }

    private upload(post:Post, encodedString:string, postKey:string) {
        this.updateMessage("Before posting");
        console.log("author" + post.authorID);
        http.request({
            url: privateData.baseURL + "/wp/v2/posts",
            method: "POST",
            headers: { "Content-Type": "application/json",
                'Authorization' : "Basic " + encodedString },
            content: JSON.stringify({
                title: post.title,
                status: "publish",
                content: post.content,
                categories: [ post.category ],
                date: post.dateTime,
                author: post.authorID
            })
        }).then((response) => {
            var result = response.content.toJSON();
            console.log(result.id);
            console.log(result.status);
            this.updateMessage("Post uploaded id:"+result.id+" status:"+result.status);
            
        }, (e) => {
            console.log("Error occurred " + e);
            this.updateMessage("Error occured");
        });        
    }
  
    private uploadPosts() {
        let javaString = new java.lang.String(privateData.credentials);
        let encodedString = android.util.Base64.encodeToString(javaString.getBytes(), android.util.Base64.DEFAULT);

        let indexData:string = applicationSettings.getString(indexKey);
        console.log(indexData);
        if (indexData) {
            let index:Array<string> = JSON.parse(indexData);
            for (var postKey of index) {
                console.log(postKey);
                let postData = applicationSettings.getString(postKey);
                if (postData) {
                    console.log(postData);
                    let post = Post.deserialise(postData);
                    this.upload(post, encodedString, postKey);
                }   
            }
        }
    }
    
}
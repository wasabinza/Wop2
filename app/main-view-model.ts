import observable = require("data/observable");
import http = require("http");
import privateData = require("./privateData");
var applicationSettings = require("application-settings");

const categoriesLookup = {
    0: 4,
    1: 3
};

const indexKey = "postIndexKey";

class Post {
    title: string;
    content: string;
    category: number;
    dateTime: Date;
};

export class HelloWorldModel extends observable.Observable {

    private _title: string;
    private _message: string;
    private _post: string;
    private _categoryIndex: number;

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

        // Initialize default values.
        this._post = "This is the test upload from my NativeScript app";
        this.updateMessage("Nothing happened just yet");
    }

    private updateMessage(notice: string) {
        this.message = notice;
    }

    private storePost() {
        var category = categoriesLookup[this._categoryIndex];
        this.updateMessage("Store posting");
        var post:Post = {
            title: this._title,
            category: category,
            content: this._post,
            dateTime: new Date()    
        };
        
        var timestamp = Date.now();
        var postKey = "postData" + timestamp;
        applicationSettings.setString(postKey, JSON.stringify(post));
        
        var indexData:string = applicationSettings.getString(indexKey, "[]");
        var index:Array<string> = JSON.parse(indexData);
        index.push(postKey);
        applicationSettings.setString(indexKey, JSON.stringify(index));
        this.updateMessage("Stored post " + index.length);
        console.log("Index length " + index.length);
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
                date: post.dateTime
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
                var postData = applicationSettings.getString(postKey);
                if (postData) {
                    var post = JSON.parse(postData);
                    this.upload(post, encodedString, postKey);
                }   
            }
        }
    }
    
}
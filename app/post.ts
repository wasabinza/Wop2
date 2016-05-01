import observable = require("data/observable");
import http = require("http");
import privateData = require("./privateData");
var imagepickerModule = require("nativescript-imagepicker");
var applicationSettings = require("application-settings");

const categoriesLookup = {
    0: 4,
    1: 3
};

const authorLookup = {
    /*Shane*/0: 1,
    /*Carolyn*/1: 2,
    /*Kate*/2: 3,
    /*Anna*/3: 4,
    /*Ethan*/4: 5
};

const authorNames = {
    1: "Shane",
    2: "Carolyn",
    3: "Kate",
    4: "Anna",
    5: "Ethan"
};

const indexKey = "postIndexKey";

export class Post extends observable.Observable {
    title: string;
    content: string;
    category: number;
    authorID: number;
    dateTime: Date;
    
    private _authorIndex: number;
    private _categoryIndex: number;
    private _message: string;
    private imageList;

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
        this.title = "Offline NativeScript Post";
        this.content = "This is the test upload from my NativeScript app";
        this.updateMessage("New post initialised");
        this.imageList = [];
    }
    

    public static deserialise(postData:string):Post {
        let postFields = JSON.parse(postData);
        let post = new Post();
        post.dateTime = new Date(postFields.dateTime);
        post.title = postFields.title;
        post.authorID = postFields.authorID;
        post.category = postFields.category;
        post.content = postFields.content;
        return post;
    }

    public dateConverter(value:Date):string {
        return value.toLocaleString();
    }

    public authorConverter(value:number):string {
        return authorNames[value];
    }


    private updateMessage(notice: string) {
        this.message = notice;
    }

    private addPictures() {
        let context = imagepickerModule.create({
            mode: "multiple"
        });
        context.authorize()
        .then(() => {
            return context.present();
        })
        .then((selection) => {
            selection.forEach(function(selected) {
                console.log("uri: " + selected.uri);           
                console.log("fileUri: " + selected.fileUri);
            });
            console.log("Existing " + this.imageList.length);
            //let newImageList = this.imageList.concat(selection);
            this.set("imageList", selection);
            console.log("new length " + this.imageList.length);           
        }).catch((e) => {
            console.log(e);
        });
    }

    private storePost() {
        console.log("authorIndex" + this._authorIndex);
        console.log("categoryIndex" + this._categoryIndex);
        this.category = categoriesLookup[this._categoryIndex];
        this.authorID = authorLookup[this._authorIndex];
        
        this.dateTime = new Date();
        
        var timestamp = Date.now();
        var postKey = "postData" + timestamp;
        applicationSettings.setString(postKey, JSON.stringify(this));
        
        let indexData:string = applicationSettings.getString(indexKey, "[]");
        let index:Array<string> = JSON.parse(indexData);
        index.push(postKey);
        applicationSettings.setString(indexKey, JSON.stringify(index));
        this.updateMessage("Stored post " + index.length);
        console.log("Index length " + index.length);
    }
    
};

import observable = require("data/observable");
import http = require("http");
import privateData = require("./privateData");

const categoriesLookup = {
    0: 4,
    1: 3
};

export class HelloWorldModel extends observable.Observable {

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

    private uploadPost() {
        var result;
        var javaString = new java.lang.String(privateData.credentials);
        var encodedString = android.util.Base64.encodeToString(javaString.getBytes(), android.util.Base64.DEFAULT);

        var category = categoriesLookup[this._categoryIndex];
        this.updateMessage("Before posting");
        http.request({
            url: privateData.baseURL + "/wp/v2/posts",
            method: "POST",
            headers: { "Content-Type": "application/json",
                'Authorization' : "Basic " + encodedString },
            content: JSON.stringify({
                //title: "Nativescript Android post",
                status: "publish",
                content: this._post,
                'categories': [ category ]
             })
        }).then((response) => {
            result = response.content.toJSON();
            console.log(result.id);
            console.log(result.status);
            this.updateMessage("Post uploaded id:"+result.id+" status:"+result.status);
        }, (e) => {
            console.log("Error occurred " + e);
            this.updateMessage("Error occured");
        });
    }
    
}
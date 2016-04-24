import { EventData } from "data/observable";
import { Page } from "ui/page";
import { HelloWorldModel } from "./main-view-model";
import { Post } from "./post";
import { SwipeGestureEventData } from "ui/gestures";
var segmentedBarModule = require("ui/segmented-bar");
var gestures = require("ui/gestures");
var frameModule = require("ui/frame");

export function newPost() {
    var topmost = frameModule.topmost();
    topmost.navigate({
        moduleName: "new-post-page",
        context: new Post()
    });        
}

// Event handler for Page "navigatingTo" event attached in main-page.xml
export function navigatingTo(args: EventData) {
    // Get the event sender
    var page = <Page>args.object;
    let source = new HelloWorldModel();
    
    source.set("dateConverter", function() {
        return "Hello";
    });
    source.set("test", new Date());
    page.bindingContext = source;
    
    page.on(gestures.GestureTypes.swipe, function (args: SwipeGestureEventData) {
        newPost();        
    });
}
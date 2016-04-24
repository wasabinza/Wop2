import { EventData } from "data/observable";
import { Page } from "ui/page";
import { HelloWorldModel } from "./main-view-model";
import { SwipeGestureEventData } from "ui/gestures";
var segmentedBarModule = require("ui/segmented-bar");
var gestures = require("ui/gestures");
var frameModule = require("ui/frame");

export function MainPage() {
    var topmost = frameModule.topmost();
    topmost.navigate("main-page");        
}

// Event handler for Page "navigatingTo" event attached in main-page.xml
export function navigatingTo(args: EventData) {
    // Get the event sender
    var page = <Page>args.object;
    page.bindingContext = page.navigationContext;

    page.on(gestures.GestureTypes.swipe, function (args: SwipeGestureEventData) {
        MainPage();        
    });
}
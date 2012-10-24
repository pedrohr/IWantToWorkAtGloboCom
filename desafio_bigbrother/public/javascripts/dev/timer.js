function Tick() {
    if (TotalSeconds <= 0) {
        return;
    }
    
    TotalSeconds -= 1;
    UpdateTimer();
    window.setTimeout("Tick()", 1000);
}

function LeadingZero(Time) {
    return (Time < 10) ? "0" + Time : + Time;
}

function UpdateTimer() {
    var Seconds = TotalSeconds;
    
    var Days = Math.floor(Seconds / 86400);
    Seconds -= Days * 86400;

    var Hours = Math.floor(Seconds / 3600);
    Seconds -= Hours * (3600);

    var Minutes = Math.floor(Seconds / 60);
    Seconds -= Minutes * (60);

    var TimeStr = ((Days > 0) ? Days + " days " : "") + LeadingZero(Hours) + ":" + LeadingZero(Minutes) + ":" + LeadingZero(Seconds);

    Timer.html(TimeStr);
}

var TotalSeconds = 37847;
var Timer = $("#timer");

UpdateTimer();
window.setTimeout("Tick()", 1000);

$("#knob").knob({
    'min':0,
    'max':100,
    'width':290,    
    'height':190,
    'thickness':0.28,
    'displayInput':false,
    'angleArc':240,
    'angleOffset':240,
    'readOnly':true,
    'fgColor':'orange',
    'bgColor':'#D8D8D8'
});

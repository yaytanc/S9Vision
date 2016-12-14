var imeBox = null;
var currentIMEObj = null;


function smartHub_txtonLoad() {
   // alert("smartHub_txtonLoad begin...");
    
    //Box
    imeBox = new IMEShell_Common();
    imeBox.inputboxID = "dsID";
    /*imeBox.onKeyPressFunc = smartHub_txt_onKeyCallback;*/
    imeBox.context = this;
    imeBox.setBlockSpace(true);

    document.getElementById("dsID").focus();
    imeBox.onShow();
}

function smartHub_txtonUnload() {
    //alert("smartHub_txtonUnload begin...");
    if (imeBox)
        imeBox.onClose();


}

//function onkeydown_input - start
function smartHub_txt_onkeydown_input(obj) {
   // alert("onkeydown_input");
    var EKC = event.keyCode;

    switch (EKC) {
        case (29443): // Enter Key
            if (obj.id == 'dsID') {
                imeBox.onShow();
                currentIMEObj = imeBox;

                var d = parseInt($("#dsID").val());
                if (d) {
                    //localStorage.setItem('dsID', d);
                    //localStorage.setItem('LGWebOSConfig', 'OK');
                    //localStorage.setItem('firstSetup', 'NO');
                    $('.configError h4').html('');
                    $('.configError').detach();
                    imeBox.onClose();
                    documentReady();
                } else {
                    $('.configError h4').html('dsID hatalı! Sadece rakam girebilir ve bu bir tam sayı olmalıdır.');
                    document.getElementById("dsID").focus();
                    imeBox.onShow();
                }
            }
            break;

        case (88):  //return
        case (45):  //exit
            alert("return =============================== ");
           
                event.preventDefault();
            
            return;
            break;
    }
}


/*function smartHub_txt_onKeyCallback(key, str, id) {
    //alert("CALLBACK onKeyCallback ===================: " + key + " ID = " + id + " STR = " + str);
    switch (key) {
        case (29443): // Enter Key
           // alert("ENTER");

            break;
        case (88):  //return
           // alert("RETURN");
            break;
        case (45):  //exit
           // alert("EXIT");
            break;
    }
}*/


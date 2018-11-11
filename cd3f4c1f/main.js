//  temporary shim until setTimeout is added to XD
global.setTimeout = (fn) => {fn()}
global.clearTimeout = (fn) => {}
// Load Jquery
const $ = require("./jquery");
// Adobx XD System Plugin
const application = require("application");
const fs = require("uxp").storage.localFileSystem;
const {Artboard} = require("scenegraph");
const commands = require("commands");
// For MulitLanguage
const languageStr = {
    "en": {
        title:"Resize and Export to Png Files",
        sucssce:"PNG Rendition has been saved!",
    },
    "ja": {
        title:"複数サイズ同時出力",
        sucssce:"出力完了しました!",
    },
    "zh": {
        title:"多尺寸图片输出",
        sucssce:"输出成功!",
    }
};

/**
 * Main Function
 * @param {*} selection 
 * @param {*} adobeXDdocumentRoot 
 */
async function exportRendition(selection, adobeXDdocumentRoot) {

    console.log("XD locale:", application.appLanguage);

    // 1.Get All Artboard push a List
    let nowNodeList = [];
    adobeXDdocumentRoot.children.forEach(node => {
        if(node instanceof Artboard){
            nowNodeList.push(node);
        }
    });

    // 2.Init Customize dialog and Set Event when Folder Select Window Show
    const dialog = initDialog(async rslist => {
        // 2.1.open Folder Select Window
        const folder = await fs.getFolder();
        // 2.2.create new folder for devices
        var newfolderObj = await createAllFolder(folder, rslist);
        console.log("newfolderObj:", newfolderObj);
        // 2.3.Export PNG file into each folder
        var renditions = await copyandexport(selection, newfolderObj, nowNodeList, rslist)
        console.log("renditions:-------------");
        // 2.4.Clear Resized Artboard which i copyed from nowNodeList
        renditions.forEach(element => {
            element.node.removeFromParent();
        });
        console.log("copyandexport:OKKKKKKKKKKKKKKKKKKKKKK!");

    });

    // 3.If Customize dialog closed, Show sucssce dialog.
    try {
        let rsList = await dialog.showModal();
        if (rsList) {
            console.log("rsList:", rsList);
            showOkDialog();
        }
    } catch (err) {
        // cancelled with ESC
    } finally {
        dialog.remove();
    }
}

/**
 * Set command with Main Function
 */
module.exports = {
    commands: {
        exportRendition,
    }
};

/*********************************************************/
/*********************************************************/
/*********************************************************/


/**
 * Init Customize Dialog use jQuery
 * @param {function} eventOnClick(resizeList) 
 */
function initDialog(eventOnClick) {
    // 1.Set Html for Dialog
    // You must write tag <dialog id="myDialog"> at the first. Because it is rule of Adobe XD 
    const dialog = $(`
<dialog id="myDialog">
    <form method="dialog" style="width:300;">
        <div class="font-title">${languageStr[application.appLanguage].title}</div>

        <div class="d-flex flex-row align-items-center my-flex-row"><span class="my-title">iPhone6/7/8</span>       <span>w</span><input value="376" type="text" id="iphone6-w"><span>h</span><input value="667" type="text" id="iphone6-h"><input type="checkbox" id="iphone6-c" checked="true"></div>
        <div class="d-flex flex-row align-items-center my-flex-row"><span class="my-title">iPhone6/7/8 Plus</span>  <span>w</span><input value="414" type="text" id="ip6plus-w"><span>h</span><input value="736" type="text" id="ip6plus-h"><input type="checkbox" id="ip6plus-c" checked="true"></div>
        <div class="d-flex flex-row align-items-center my-flex-row"><span class="my-title">iPhoneX/XS</span>        <span>w</span><input value="375" type="text" id="iphonex-w"><span>h</span><input value="812" type="text" id="iphonex-h"><input type="checkbox" id="iphonex-c" checked="true"></div>
        <div class="d-flex flex-row align-items-center my-flex-row"><span class="my-title">iPhone XS Max/ XR</span> <span>w</span><input value="414" type="text" id="iphxmax-w"><span>h</span><input value="896" type="text" id="iphxmax-h"><input type="checkbox" id="iphxmax-c" checked="true"></div>
        <div class="d-flex flex-row align-items-center my-flex-row"><span class="my-title">XiaoMi8</span>           <span>w</span><input value="393" type="text" id="xiaomi8-w"><span>h</span><input value="778" type="text" id="xiaomi8-h"><input type="checkbox" id="xiaomi8-c" checked="true"></div>
        <div class="d-flex flex-row align-items-center my-flex-row"><span class="my-title">Customize</span>         <span>w</span><input autofocus value="" type="text" id="cutomiz-w"><span>h</span><input value="" type="text" id="cutomiz-h"><input type="checkbox" id="cutomiz-c"></div>

     <!--  <hr>  -->
     <!--  <label>  -->
     <!--      <span>Log</span>  -->
     <!--      <textarea name="" id="" readonly></textarea>  -->
     <!--  </label>  -->

        <footer>
            <button id="cancel">Close</button>
            <button type="button" id="ok" uxp-variant="cta">Export</button>
        </footer>
    </form>
</dialog>
`).get(1);

    // 2.Set Style Sheet
    document.body.innerHTML = `
<style>
.font-title{
    font-size:15rem;
    padding-bottom : 10rem;
}
.my-flex-row{
    font-size:11rem;
}
.my-flex-row .my-title{
    width: 150px;
}
.my-flex-row input[type=text]{
    width: 50px;
}
textarea {
    height:200px !important;
    min-height: 200px !important;
    max-height: 200px !important;
}
.d-flex {
    display: -ms-flexbox !important;
    display: flex !important;
}
.flex-row {
    -ms-flex-direction: row !important;
    flex-direction: row !important;
}
.align-items-center {
    -ms-flex-align: center !important;
    align-items: center !important;
}
</style>`;

    // $(document.head).append('<link rel="stylesheet" href="bootstrap.min.css">');
    $(document.body).append(dialog);
    const form = document.querySelector("form");
    form.style.width = "300px";

    // 3.Set Button Event use jQuery like write HTML
    $("#cancel").on("click", () => {
        dialog.close();
    });

    // 4.Set Button Event use jQuery like write HTML
    $("#ok").on("click", async () => {
        const formIdNameArray = [
            "iphone6",
            "ip6plus",
            "iphonex",
            "iphxmax",
            "xiaomi8",
            "cutomiz",
        ];
        var resizeList = [];

        // 5.Get date from dialog
        formIdNameArray.forEach(inputId => {
            if ($("#" + inputId + "-c").is(":checked") && $.isNumeric($("#" + inputId + "-w").val()) && $.isNumeric($("#" + inputId + "-h").val())) {
                resizeList.push({
                    folder: inputId,
                    width: Number($("#" + inputId + "-w").val()),
                    height: Number($("#" + inputId + "-h").val())
                });
            }

        });

        await eventOnClick(resizeList);

        dialog.close(resizeList);
    });

    return dialog;
}

/**
 * Set File Name be a true name
 * @param {String} strname File Name
 */
function rename(strname) {

    if (strname.length == 0) {
        return strname;
    }
    return strname.replace(/\\/g, '-')
        .replace(/\//g, '-')
        .replace(/\:/g, '-')
        .replace(/\*/g, '-')
        .replace(/\?/g, '-')
        .replace(/\"/g, '-')
        .replace(/\</g, '-')
        .replace(/\>/g, '-')
        .replace(/\|/g, '-')
        .replace(/\#/g, '-');

}

/**
 * Create new folder or Get it
 * @param {Folder} folder Adobx XD System Plugin
 * @param {array} rslist Data from Customize Dialog
 */
async function createAllFolder(folder, rslist) {
    var returnList = {};
    // await Promise.all(some_array.map(async yournamed_object =>{})); 
    // Just this Code can let array for run Synchronization.
    // This code take me All of day! So this code is very Impotant!
    await Promise.all(rslist.map(async resizeObj => {
        // 1.Create new folder
        var tempFolder = await folder.createFolder(resizeObj.folder)
            .catch(async error => {
                console.log("error:", error);
                // 2.If the folder has created,get it
                return await folder.getEntry(resizeObj.folder)
                    .catch(error2 => {
                        console.log("error2:", error2);
                    })
                    .then(gfolder => {
                        return gfolder;
                    })
            })
            .then(tfolder => {
                return tfolder;
            })
        returnList[resizeObj.folder] = tempFolder;
    }));


    return returnList;
}

/**
 * Export Png File
 * @param {*} selection Adobx XD System Plugin,For Copy Artboard
 * @param {*} newfolderObj Folders List
 * @param {*} nowNodeList Artboard List
 * @param {*} rslist Data from Customize Dialog
 */
async function copyandexport(selection, newfolderObj, nowNodeList, rslist) {

    // i and j, just a test for the code is run by synchronization.
    var i = 0;
    var j = 0;

    console.log("i:", i);
    console.log("j:", j);


    var renditions = [];

    await Promise.all(nowNodeList.map(async node => {
        // 1.get File Name
        let temprename = rename(node.name);
        // 2.get a Artboad 
        selection.items = node;

        // i and j, just a test for the code is run by synchronization.
        console.log("Start:", temprename);
        i++;
        console.log("i:", i);

        await Promise.all(rslist.map(async resizeObj => {
            // i and j, just a test for the code is run by synchronization.
            j++;
            console.log("j:", j);

            // 3.Copy Artboard to a new Artboard
            commands.duplicate();
            let tempClone = selection.items[0];
            // 4.Resize the new Artboard with Customize Dialog Set
            tempClone.resize(resizeObj.width, resizeObj.height);
            // 5.Create a temp file in memory
            let tempFolder = newfolderObj[resizeObj.folder];
            let tempfile = await tempFolder.createFile(temprename + ".png", {
                    overwrite: true
                })
                .catch(function (error) {
                    console.log("createFile error:", error);
                })
                .then(function (obj) {
                    console.log("createFile OK:", obj);
                    return obj;
                });
            // 6.Push Data into create list(renditions)
            renditions.push({
                node: tempClone,
                outputFile: tempfile,
                type: "png",
                scale: 1
            });
            console.log("tempfile type:", typeof tempfile);
            console.log("renditions.length:", renditions.length);

        }));

    }));

    // 7.Create file to realy disk which in create list(renditions)
    return application.createRenditions(renditions)
        .catch(error => {
            console.log("application.createRenditions error:", error, "renditions.length:", renditions.length);
            return renditions;
        })
        .then(() => {
            console.log("application.createRenditions okkkkkkkkkk");
            return renditions;
        });


}

/**
 * Show OK Dialog
 */
function showOkDialog() {
    let dialog = document.createElement("dialog");

    // main container
    let container = document.createElement("div");
    container.style.minWidth = 400;
    container.style.padding = 40;

    // add content
    let title = document.createElement("h3");
    title.style.padding = 20;
    title.textContent = languageStr[application.appLanguage].sucssce;
    container.appendChild(title);

    // close button
    let closeButton = document.createElement("button");
    closeButton.textContent = "OK";
    container.appendChild(closeButton);
    closeButton.onclick = (e) => {
        dialog.close();
    }

    document.body.appendChild(dialog);
    dialog.appendChild(container);
    dialog.showModal()

}
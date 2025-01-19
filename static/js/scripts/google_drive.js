/* exported gapiLoaded */
/* exported gisLoaded */
/* exported handleAuthClick */
/* exported handleSignoutClick */

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
const SCOPES = 'https://www.googleapis.com/auth/drive';

// TODO(developer): Set to client ID and API key from the Developer Console
const CLIENT_ID = '328244640196-vvr92ue098ulgtdppdsic3h3lpu8tsgc.apps.googleusercontent.com';
const API_KEY = 'AIzaSyCaZRgLsqo8RVjsp8fmfyETqHS392KJ-40';

const APP_ID = '';
let tokenClient;
console.log("TOKEN: ", accessToken);
let pickerInited = false;
let gisInited = false;
let selectedFilesCount = 0;
let selectedFiles = []


document.getElementById('authorize_button').style.visibility = 'hidden';

/**
 * Callback after api.js is loaded.
 */
function gapiLoaded() {
  gapi.load('client:picker', initializePicker);
}

/**
 * Callback after the API client is loaded. Loads the
 * discovery doc to initialize the API.
 */
async function initializePicker() {
  await gapi.client.load('https://www.googleapis.com/discovery/v1/apis/drive/v3/rest');
  pickerInited = true;
  selectedFilesCount = 0;
  selectedFiles = []
  maybeEnableButtons();
}

/**
 * Callback after Google Identity Services are loaded.
 */
function gisLoaded() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: 'https://ad8e-2407-d000-403-5edd-a509-98bf-3db5-ec3.ngrok-free.app', // defined later
  });
  gisInited = true;
  maybeEnableButtons();
}

/**
 * Enables user interaction after all libraries are loaded.
 */
function maybeEnableButtons() {
  if (pickerInited && gisInited) {
    document.getElementById('authorize_button').style.visibility = 'visible';
  }
}

/**
 *  Sign in the user upon button click.
 */
function handleAuthClick() {
    createPicker();
  }

/**
 *  Sign out the user upon button click.
 */
function handleSignoutClick() {
  if (accessToken) {
    accessToken = null;
    google.accounts.oauth2.revoke(accessToken);
    document.getElementById('content').innerText = '';
    document.getElementById('authorize_button').innerText = 'Authorize';
  }
}

/**
 *  Create and render a Picker object for searching images.
 */
function createPicker() {
  const view = new google.picker.View(google.picker.ViewId.DOCS);
  // view.setMimeTypes('image/png,image/jpeg,image/jpg');
  const picker = new google.picker.PickerBuilder()
      .enableFeature(google.picker.Feature.NAV_HIDDEN)
      .enableFeature(google.picker.Feature.MULTISELECT_ENABLED)
      .setDeveloperKey(API_KEY)
      .setAppId(APP_ID)
      .setOAuthToken(accessToken)
      .addView(view)
      .addView(new google.picker.DocsUploadView())
      .setCallback(pickerCallback)
      .build();
  picker.setVisible(true);
}

/**
* Displays the file details of the user's selection.
* @param {object} data - Containers the user selection from the picker
*/
async function pickerCallback(data) {
  if (data.action === google.picker.Action.PICKED) {
    selectedFilesCount = data[google.picker.Response.DOCUMENTS].length;
    selectedFiles = data[google.picker.Response.DOCUMENTS];
    if(selectedFilesCount>0){uploadFromDrive = true;}
    $("#no_of_drive_files").text(`Number of files: ${selectedFilesCount}`);
  }
}

async function pickerSubmit() {
  let files = []; // Array to hold the created file objects
  $("#submit_button").prop('disabled', true).text("Uploading");
  let uploadText = "Uploading";
  let dots = 0;

  const uploadInterval = setInterval(() => {
      dots = (dots + 1) % 4; // Cycle through 0, 1, 2, 3 dots
      const text = uploadText + ".".repeat(dots);
      $("#submit_button").text(text);
  }, 500); // Update text every 500 milliseconds

  $("#cancel_button").prop('disabled', false);
  for (var i = 0; i < selectedFiles.length; i++) {
    const document = selectedFiles[i];
    const fileId = document[google.picker.Document.ID];
    const fileName = document[google.picker.Document.NAME];
    console.log(fileId);

    try {
      const blob = await fetchDriveFileAsBlob(fileId, accessToken);
      const file = new File([blob], fileName, {
        type: blob.type,
      });
      files.push(file);
    } catch (error) {
      console.error("Error fetching file as blob:", error);
    }
  }
  console.log("Uploaded Files: ", files);

  // Now uploadedFiles contains File objects as if they were selected from an input element
  // You can now handle these files as needed, e.g., append them to FormData and upload to a server
  const getFormDataSize = (formData) => [...formData].reduce((size, [name, value]) => size + (typeof value === 'string' ? value.length : value.size), 0);

  var formData=new FormData();
  formData.append("csrfmiddlewaretoken", csrf);
  formData.append("patient_id", patient_id);
  formData.append("anotomy_id",document.getElementById("anotomy").value);
  formData.append("modality_id",document.getElementById("modality").value);
  if(!validateAge()){ return false; }
  formData.append("age",document.getElementById("age").value);
  const selectedDiseases = $('#diseases').val();
  selectedDiseases.forEach(function(diseaseId, index) {
      formData.append('diseases[]', diseaseId);
  });

  var totalSize = getFormDataSize(formData);
  for (var x = 0; x < files.length; x++) {
      totalSize = totalSize + files[x].size;
  }
  console.log("TOTAL SIZE: ", totalSize);
  var temp = 0;
  var completed_req = 0
  var uploaded = 0;
  var indices = [...Array(files.length).keys()]
  const chunkSize = 5;

  for (let i = 0; i < indices.length; i += chunkSize) {
      const chunk = indices.slice(i, i + chunkSize);
      var flag = false;

      console.log("chunk size: ",chunk.length);
      for (var x = 0; x < chunk.length; x++) {
          formData.append("media_files[]", files[chunk[x]]);
      }
      var xhr=new XMLHttpRequest();
      xhr.open("POST","/image_insert/",true);
      xhr.upload.addEventListener("progress",function (ev) {
          if(ev.lengthComputable){
              temp = uploaded + ev.loaded;
              var percentage=(temp/totalSize*100|0);
              document.getElementById("progress_bar_div").hidden = false;
              document.getElementById("progress_bar").style["width"]=""+percentage+"%";
              document.getElementById("progress_bar").innerHTML=""+percentage+"%";
              console.log("Uploaded : "+temp);
              console.log("TOTAL : "+totalSize);

              if (ev.total==ev.loaded){
                  // console.log("                this is goodd");
                  // console.log("                ev. loaded", ev.loaded);
                  // console.log("                ev.  total", ev.total);
                  // console.log("                  uploaded", uploaded);
                  // console.log("                     total", totalSize);
                  uploaded = uploaded + ev.loaded;
                  completed_req = completed_req + 1
                  // console.log("                         this is goodd");
                  // console.log("                         ev. loaded", ev.loaded);
                  // console.log("                         ev.  total", ev.total);
                  // console.log("                           uploaded", uploaded);
                  // console.log("                              total", totalSize);
              }
          }
      });
      xhr.upload.onloadend = function (e) {
          if((completed_req==indices.length) || (completed_req>(indices.length/chunkSize) && completed_req<((indices.length/chunkSize)+1))){
              setTimeout(function(){
                  location.reload();
              }, 3000);
          }
      };
      xhr.onload = function () {window.location();}
      xhr.onerror = function () {window.location();}
      xhr.send(formData);
      formData.delete("media_files[]");
  }
}

function downloadFile(data, filename, mimeType) {
  // Step 1: Create a Blob from the data
  const blob = new Blob([data], { type: 'application/dicom' });

  // Step 2: Create a URL for the Blob
  const url = URL.createObjectURL(blob);

  // Step 3: Create an anchor (<a>) element and trigger the download
  const a = document.createElement('a');
  a.href = url;
  a.download = filename; // Set the file name for the download
  document.body.appendChild(a); // Append the anchor to the document
  a.click(); // Simulate a click on the anchor

  // Clean up by revoking the blob URL and removing the anchor from the document
  URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

async function fetchDriveFileAsBlob(fileId, accessToken) {
  return new Promise((resolve, reject) => {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`);
    xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
    xhr.responseType = 'blob';
    xhr.onload = () => {
      if (xhr.status === 200) {
        resolve(xhr.response);
      } else {
        reject(new Error('Failed to download file'));
      }
    };
    xhr.onerror = () => reject(new Error('Network error'));
    xhr.send();
  });
}
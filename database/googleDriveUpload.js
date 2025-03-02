// const fs = require("fs");
// const { google } = require("googleapis");

// const apikeys = require("../api-keys.json");
// const SCOPE = ["https://www.googleapis.com/auth/drive"];

// // A Function that can provide access to google drive api
// async function authorize() {
//   const jwtClient = new google.auth.JWT(
//     apikeys.client_email,
//     null,
//     apikeys.private_key,
//     SCOPE
//   );

//   await jwtClient.authorize();

//   return jwtClient;
// }

// // A Function that will upload the desired file to google drive folder
// async function uploadFile(authClient, filePath, mimeType, fileName) {
//   return new Promise((resolve, rejected) => {
//     const drive = google.drive({ version: "v3", auth: authClient });

//     var fileMetaData = {
//       name: fileName,
//       parents: ["1gTI4jD6el362MT2ImrSUpM1lD44m90Lx"], // A folder ID to which file will get uploaded
//     };

//     drive.files.create(
//       {
//         resource: fileMetaData,
//         media: {
//           body: fs.createReadStream(filePath), // files that will get uploaded
//           mimeType: mimeType,
//         },
//         fields: "id",
//       },
//       function (error, file) {
//         if (error) {
//           return rejected(error);
//         }
//         resolve(file);
//       }
//     );
//   });
// }

// module.exports = { authorize, uploadFile };

const fs = require("fs");
const { google } = require("googleapis");

const apikeys = require("../api-keys.json");
const SCOPE = ["https://www.googleapis.com/auth/drive"];

// A Function that can provide access to Google Drive API
async function authorize() {
  const jwtClient = new google.auth.JWT(
    apikeys.client_email,
    null,
    apikeys.private_key,
    SCOPE
  );

  await jwtClient.authorize();

  return jwtClient;
}

// A Function that will upload the desired file to Google Drive folder
async function uploadFile(authClient, filePath, mimeType, fileName) {
  return new Promise((resolve, reject) => {
    const drive = google.drive({ version: "v3", auth: authClient });

    var fileMetaData = {
      name: fileName,
      parents: ["1gTI4jD6el362MT2ImrSUpM1lD44m90Lx"], // A folder ID to which the file will be uploaded
    };

    drive.files.create(
      {
        resource: fileMetaData,
        media: {
          body: fs.createReadStream(filePath), // File that will be uploaded
          mimeType: mimeType,
        },
        fields: "id, name", // ✅ Includes both 'id' and 'name' in the response
      },
      function (error, file) {
        if (error) {
          return reject(error);
        }
        resolve(file.data); // ✅ Returns the file's ID and name directly
      }
    );
  });
}

module.exports = { authorize, uploadFile };

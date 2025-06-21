import { checkExistFolder } from "../utils/commonFunc";
import { filesPath } from "../utils/filePathConsts";


function checkFolders() {
  checkExistFolder(filesPath);
}

export async function initFunc() {
  checkFolders()
}

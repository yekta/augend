export const nanoAPI = "https://app.natrium.io/api";
export const banAPI = "https://kaliumapi.appditto.com/api";
export const nanoExplorer = "https://nanexplorer.com";
export const banExplorer = "https://creeper.banano.cc";
export const nanoAvatarUrl = "https://natricon.com/api/v1/nano";
export const banAvatarUrl = "https://monkey.banano.cc/api/v1/monkey";

export function rawToBanOrNano(n: string, isNano: boolean) {
  return isNano ? rawToNano(n) : rawToBan(n);
}

function rawToBan(n: string) {
  const number = parseFloat(n);
  return number / Math.pow(10, 29);
}

function rawToNano(n: string) {
  const number = parseFloat(n);
  return number / Math.pow(10, 30);
}

export function getExplorerUrl(address: string) {
  return isNano(address)
    ? `${nanoExplorer}/nano/account/${address}`
    : `${banExplorer}/account/${address}`;
}

export function getAvatarUrl(address: string) {
  return isNano(address)
    ? `${nanoAvatarUrl}?address=${address}`
    : `${banAvatarUrl}/${address}`;
}

export function isNano(address: string) {
  return address.startsWith("nano_");
}

export function isBan(address: string) {
  return address.startsWith("ban_");
}

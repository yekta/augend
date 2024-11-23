import {
  bananoAvatarUrl,
  bananoExplorer,
  nanoAvatarUrl,
  nanoExplorer,
} from "@/server/trpc/api/routers/nano-banano/constants";

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
    : `${bananoExplorer}/account/${address}`;
}

export function getAvatarUrl(address: string) {
  return isNano(address)
    ? `${nanoAvatarUrl}?address=${address}`
    : `${bananoAvatarUrl}/${address}`;
}

export function isNano(address: string) {
  return address.startsWith("nano_");
}

export function isBan(address: string) {
  return address.startsWith("ban_");
}

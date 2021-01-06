import {JediProps} from "../todoJedi/JediProps";
import {getLogger} from "../core";
import {Plugins} from "@capacitor/core";
const { Storage } = Plugins;
const log = getLogger("localStorageApi");

interface FromStorage{
    myValue: JediProps[]
}

// Saving ({ key: string, value: string }) => Promise<void>
export async function addToStorage (key: string, myValue: any) {
    log("storing: ",key, myValue);
    return await Storage.set({
        key: key,
        value: JSON.stringify(
            {myValue}
        )
    });
}

export async function getFromStorage(key: string){

    const x = await Storage.get({key : key });
    // const y = await Storage.get({key: key});
    //log("Y: "+ y.value) ramane bine!
    return x;
}

// Loading value by key ({ key: string }) => Promise<{ value: string | null }>
export async function getListFromStorage (key: string) {
    const stringFromStorage =  (await getFromStorage(key)).value;
    //log(stringFromStorage)
    const val:FromStorage  = JSON.parse(stringFromStorage ? stringFromStorage : "[]")
    //log("get list from storage: "+val.myValue)

    return val.myValue;
}


//   // Loading keys () => Promise<{ keys: string[] }>
//   const { keys } = await Storage.keys();
//   console.log('Keys found', keys);

// Removing value by key, ({ key: string }) => Promise<void>
export async function removeFromStorage(key: string) {
    await Storage.remove({ key: key });
    //console.log('Keys found after remove', await Storage.keys());
}


//  Clear storage () => Promise<void>
export async function clear() {
    return await Storage.clear();
};
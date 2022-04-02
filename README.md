# About

A modern module that brings Roblox API to Javascript and Typescript with little learning curve. Roblox.js is designed to be as close as possible to native Luau APIs, therefore making it very easy to transition to.

# Installation
> **Warning: This module is in early stage of development, and therefore, breaking changes might often occur with each update until 1.0.0 comes out.**


> Note: Typescript is supported out of the box, and therefore, no `@types` have to be installed.

NPM
```bash
npm i roblox.js
```

Yarn
```bash
yarn add roblox.js
```

# DataStores
In this section you will learn on how to use DataStores using this NPM package.

## Accessing DataStores
In Luau you would write the following.
```lua
local DataStoreService = game:GetService("DataStoreService")
local coinsStore = DataStoreService:GetDataStore("Coins")
```
On the other hand, in Javascript, you will write this.
```js
const { Game, DataStore } from "roblox.js";
const game = new Game("your-api-key", 0000000000);
const coinsStore = new DataStore(game, "Coins");
```
1. Replace `"your-api-key"` with your API key, which you can obtain via Roblox's [Creator Dashboard](https://create.roblox.com/credentials). **However, please be very careful where you store it as anyone that gets their hands on it, will be able to do pretty much anything with your DataStores, even as far as deleting all of the data if the API key's permissions allow it.**

2. Replace `0000000000` with the universe id, do not mistake it for place id, which can be found on yours game's page. Instead, use [Creator Dashboard](https://create.roblox.com/credentials) to find your universe id.

![screenshot](https://imgur.com/W0iYHVV.png)

## Setting Data
Luau
```lua
local success, errorMessage = pcall(function()
    coinsStore:SetAsync("User_1234", 50)
end)
if not success then
    print(errorMessage)
end
```
Javascript + Roblox.js
```js
try {
    await coinsStore.SetAsync("User_1234", 50);
} catch (e) {
    console.log(e);
}
```

## Reading Data
Luau
```lua
local success, coins = pcall(function()
    return coinsStore:GetAsync("User_1234")
end)
if success then
    print(coins) -- Output: 50
end
```
Javascript + Roblox.js
```js
try {
    const [coins] = await coinsStore.GetAsync("User_1234");
    console.log(coins); // Output: 50
} catch (e) {
    console.log(e);
}
```

## Incrementing Data
Luau
```lua
local success, newCoins = pcall(function()
    return coinsStore:IncrementAsync("User_1234", 1)
end)
if success then
    print(newCoins) -- Output: 51
end
```
Javascript + Roblox.js
```js
try {
    const [newCoins] = await coinsStore.IncrementAsync("User_1234", 1);
    console.log(newCoins); // Output: 51
} catch (e) {
    console.log(e);
}
```

## Removing Data
Luau
```lua
local success, removedValue = pcall(function()
    return nicknameStore:RemoveAsync("User_1234")
end)
if success then
    print(removedValue)
end
```
Javascript + Roblox.js
```js
try {
    const [removedCoins] = await coinsStore.RemoveAsync("User_1234");
    console.log(removedCoins); // Output: 51
} catch (e) {
    console.log(e);
}
```

## Listing Keys
Luau
```lua
local pages = coinsStore:ListKeysAsync()
while true do
    local items = pages:GetCurrentPage()
    for _, v in pairs(items) do
        print(v.KeyName)
    end
    if pages.IsFinished then break end
    pages:AdvanceToNextPageAsync()
    task.wait(1)
end
```
Javascript + Roblox.js
```js
// Roblox task.wait() implementation in Javascript
function wait(seconds) {
    return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

const pages = datastore.ListKeysAsync();
let page;

while (page = await pages) {
    const keys = await page.GetCurrentPageAsync();
    for (const v of keys) {
        console.log(v.key);
    }
    if (page.isFinished) break;
    await page.AdvanceToNextPageAsync();
    await wait(1);
}
```

## UserId Tagging
Luau
```lua
local success, errorMessage = pcall(function()
    coinsStore:SetAsync("User_1234", 50, {1234})
end)
if not success then
    print(errorMessage)
end
```
Javascript + Roblox.js
```js
try {
    coinsStore.SetAsync("User_1234", 50, [1234]);
} catch (e) {
    console.log(e);
}
```

## Metadata
Luau
```lua
local setOptions = Instance.new("DataStoreSetOptions")
setOptions:SetMetadata({
    ["ExperienceElement"] = "Fire"
})

local success, errorMessage = pcall(function()
    coinsStore:SetAsync("User_1234", 50, {1234}, setOptions)
end)
if not success then
    print(errorMessage)
end
```
Javascript + Roblox.js
```js
const setOptions = new DataStoreSetOptions();
setOptions.SetMetadata({
    ExperienceElement: "Fire"
});

try {
    coinsStore.SetAsync("User_1234", 50, [1234], setOptions);
} catch (e) {
    console.log(e);
}
```
That's it. More will be coming soon!

# License
[MIT](LICENSE)
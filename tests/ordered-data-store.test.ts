import { describe, expect, test } from "bun:test";

import { Universe, OrderedDataStore, DataStorePages } from "../src/index";

const API_KEY = process.env.API_KEY as string;
const UNIVERSE_ID = parseInt(process.env.UNIVERSE_ID as string);

function sleep(duration: number) {
	return new Promise(resolve => setTimeout(resolve, duration));
}

// Every testing group (describe) must get its own store to avoid tainting other testing groups
enum Store {
	GetSortedAsync = "GetSortedAsync",
	SetAsync = "SetAsync",
	GetAsync = "GetAsync",
	RemoveAsync = "RemoveAsync",
	UpdateAsync = "UpdateAsync"
}

const universe = new Universe(UNIVERSE_ID, API_KEY);

async function clearEntries() {
	for (const storeName of Object.keys(Store)) {
		const store = new OrderedDataStore(universe, storeName);
		const pages = await store.GetSortedAsync(true, 100);
		while (true) {
			if (pages.IsFinished) {
				break;
			}
			for await (const entry of pages.GetCurrentPage()) {
				await store.RemoveAsync(entry.key);
			}
			await pages.AdvanceToNextPageAsync();
			await sleep(500);
		}
	}
}

// Make sure that the stores are empty
await clearEntries();

describe("GetSortedAsync", async () => {
	const store = new OrderedDataStore(universe, Store.GetSortedAsync);
	
	const pages = await store.GetSortedAsync(true, 100);

	test("Must return pages", () => {
		expect(pages).toBeInstanceOf(DataStorePages);
	});

	test("Must have IsFinished boolean property", () => {
		expect(pages.IsFinished).toBeBoolean();
	});

	// test("Must return exactly 1 entry", () => {
		
	// });
});

describe("SetAsync", () => {
	const store = new OrderedDataStore(universe, Store.SetAsync);

	test("Must not return anything", async () => {
		const value = await store.SetAsync("Mark", 100);
		expect(value).toBeUndefined();
	});

	test("Created entry must exist", async () => {
		const value = await store.GetAsync("Mark");
		expect(value).toBeNumber();
	});
});

describe("GetAsync", () => {
	const store = new OrderedDataStore(universe, Store.GetAsync);

	test("Must return correct value", async () => {
		await store.SetAsync("Mark", 100);
		const value = await store.GetAsync("Mark");
		expect(value).toBe(100);
	});
});

describe("RemoveAsync", () => {
	const store = new OrderedDataStore(universe, Store.RemoveAsync);

	test("Must not return anything", async () => {
		await store.SetAsync("Mark", 100);

		const value = await store.RemoveAsync("Mark");
		expect(value).toBeUndefined();
	});

	test("Must properly delete entry", async () => {
		await store.SetAsync("Mark", 100);

		expect(await store.GetAsync("Mark")).toBeNumber();

		await store.RemoveAsync("Mark");
		
		expect(await store.GetAsync("Mark")).toBeUndefined();
	});
});

describe("UpdateAsync", () => {
	const store = new OrderedDataStore(universe, Store.UpdateAsync);

	test("Must provide correct value", async () => {
		await store.SetAsync("Mark", 100);

		await store.UpdateAsync("Mark", currentValue => {
			expect(currentValue).toBe(100);
		});
	});

	test("Must return nothing when value is not updated", async () => {
		await store.SetAsync("Mark", 100);

		const updatedValue = await store.UpdateAsync("Mark", currentValue => {
			expect(currentValue).toBeNumber();
		});

		expect(updatedValue).toBeUndefined();
	});

	test("Must return the correct updated value", async () => {
		await store.SetAsync("Mark", 100);

		const updatedValue = await store.UpdateAsync("Mark", currentValue => {
			expect(currentValue).toBe(100);
			return currentValue + 1;
		});

		expect(updatedValue).toBe(101);
	});

	test("Updated value must be returned from GetAsync", async () => {
		await store.SetAsync("Mark", 100);

		const updatedValue = await store.UpdateAsync("Mark", currentValue => {
			expect(currentValue).toBe(100);
			return currentValue + 1;
		});

		expect(updatedValue).toBe(101);

		const getAsyncValue = await store.GetAsync("Mark");
		expect(getAsyncValue).toBeNumber();
		expect(getAsyncValue).toBe(101);
	});
});

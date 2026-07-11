import { runAffinirumTests } from "./helpers/AffinirumTest.js";

describe("Timestamp function test", ()=> {
	runAffinirumTests([
		{
			script: "Timestamp.Now().EpochTime > 0",
			cases: [
				{ values: {}, result: true },
			],
		},
		{
			script: "Timestamp.Parse(v).Format(f)",
			cases: [
				{ values: { v: "2020-02-20T20:30:40.555Z", f: "ZYYYY/MM/DD hh:mm:ss.fffZ" }, result: "2020/02/20 20:30:40.555" },
			],
		},
		{
			script: "Timestamp.Parse(v)",
			cases: [
				{ values: { v: "not a timestamp" }, result: undefined },
			],
		},
		{
			script: "Timestamp.Epoch(v, epoch).EpochTime(epoch)",
			cases: [
				{ values: { v: 5000n, epoch: new Date("2020-01-01T00:00:00.000Z") }, result: 5000n },
			],
		},
		{
			script: "Timestamp.Decode(Timestamp.Epoch(v).Encode).EpochTime",
			cases: [
				{ values: { v: 60n }, result: 60n },
				{ values: { v: 1055n }, result: 1055n },
			],
		},
		{
			script: "Timestamp.Decode(v, enc, offset).EpochTime",
			cases: [
				{ values: { v: new Uint8Array([0xff, 0xe8, 0x03, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]).buffer, enc: "int64le", offset: 1n }, result: 1000n },
			],
		},
		{
			script: "v.Format(f)",
			cases: [
				{ values: { v: new Date("2025-01-10"), f: "MM" }, result: "01" },
				{ values: { v: new Date("2025-01-10"), f: "YY" }, result: "25" },
			],
		},
		{
			script: "d.Year(true) == 2025 & d.Month(true) == 4 & d.MonthIndex(true) == 3 & d.WeekdayIndex(true) == 2 & d.Day(true) == 22",
			cases: [
				{ values: { d: new Date("2025-04-22T03:04:05.099Z") }, result: true },
			],
		},
		{
			script: "d.Hour(true) == 3 & d.Minute(true) == 4 & d.Second(true) == 5 & d.Millisecond(true) == 99",
			cases: [
				{ values: { d: new Date("2025-04-22T03:04:05.099Z") }, result: true },
			],
		},
		{
			script: "d.Minute(true)",
			cases: [
				{ values: { d: new Date("2025-04-22 03:04:05.99Z") }, result: 4n },
			],
		},
		{
			script: "Timestamp.Epoch(a.EpochTime).Format(b)",
			cases: [
				{ values: { a: new Date("2020-02-25 20:30:45.555Z"), b: "ss" }, result: "45" },
				{ values: { a: new Date("2020-02-25 20:30:45.555Z"), b: "fff" }, result: "555" },
			],
		},
		{
			script: "a.Format('ZYYYY/MM/DD hh:mm:ss.fffZ')",
			cases: [
				{ values: { a: new Date("2020-02-20 20:30:40.555Z") }, result: "2020/02/20 20:30:40.555" },
			],
		},
		{
			script: "a.DaysSince(b)",
			cases: [
				{ values: { a: new Date("2020-01-02 10:30:33"), b: new Date("2020-01-03 10:30:33") }, result: -1 },
				{ values: { a: new Date("1970-01-05 00:30:33"), b: new Date("1970-01-10 00:30:33") }, result: -5 },
			],
		},
		{
			script: "a.HoursSince(b)",
			cases: [
				{ values: { a: new Date("2020-01-02 20:30:33"), b: new Date("2020-01-02 10:30:33") }, result: 10 },
				{ values: { a: new Date("1970-01-05 22:30:33"), b: new Date("1970-01-05 01:30:33") }, result: 21 },
			],
		},
		{
			script: "a.MinutesSince(b)",
			cases: [
				{ values: { a: new Date("2020-01-02 20:30:33"), b: new Date("2020-01-02 10:30:33") }, result: 600 },
				{ values: { a: new Date("1970-01-05 22:30:33"), b: new Date("1970-01-05 20:30:33") }, result: 120 },
			],
		},
		{
			script: "a.SecondsSince(b)",
			cases: [
				{ values: { a: new Date("2020-01-02 11:30:33"), b: new Date("2020-01-02 10:30:33") }, result: 3600 },
				{ values: { a: new Date("1970-01-05 22:30:33"), b: new Date("1970-01-05 20:30:33") }, result: 7200 },
			],
		},
	]);
});

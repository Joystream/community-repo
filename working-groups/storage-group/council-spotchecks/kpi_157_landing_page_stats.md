KPI 15.7 - Follow up the Storage Working Group
Scope of work 4 - Landing Page Load Report

Testing was performed manually as no script that was easy to use was found. Each run was done with `disable caching` and used a slow scroll speed until approximately 1000 requests had been made.

No way was found to analyze HAR files, so no per-provider statistics are available. I have however highlighted providers that faced issues with long response times.

* 28 July
	* Average `wait` time: 3764.211 ms
	* Sum `wait` time: 3760447.103 ms
	* Average `time`: 4643.596 ms
	* Sum `time`: 5149748.155 ms
	* Other stats
		* 6 responses >1m
		* ~30 responses >30s
		* ~60% of responses <1s
	* Slow providers (these servers had response times >30s for at least 10 responses each):
		* `ru.joystreamstats.live`
		* `mahathvamtv.com`
		* `gloiaf.eu`
* 30 July
	* Average `wait` time: 1028.653 ms
	* Sum `wait` time: 1130489.856 ms
	* Average `time`: 1466.291 ms
	* Sum `time`: 1609988.068 ms
	* Other stats:
		* 0 responses >1m
		* ~25 responses >10s
		* ~1 response >30
		* ~70% of responses <1s
	* Slow providers (these servers had response times >10s for at least 5 responses each):
		* `ru.joystreamstats.live`
		* `mahathvamtv.com`
* 31 July
	* Average `wait` time: 1176.378 ms
	* Sum `wait` time: 1184613.081 ms
	* Average `time`: 1555.64 ms
	* Sum `time`: 1564982.383 ms
	* Other stats:
		* 0 responses >1m
		* ~40 responses >10s
		* 0 responses >30s
		* ~70% of responses <1s
	* Slow providers (these servers had response times >10s for at least 5 responses each):
		* `ru.joystreamstats.live`
		* `mahathvamtv.com`
		* `xjames.xyz`
* 1 August
	* Average `wait` time: 1061.578 ms
	* Sum `wait` time: 1070071.515 ms
	* Average `time`: 1467.757 ms
	* Sum `time`: 1478031.84 ms
	* Other stats:
		* 0 responses >1m
		* ~30 responses >10s
		* 0 responses >30s
		* ~70% of responses <1s
	* Slow providers (these servers had response times >10s for at least 5 responses each): 
		* `ru.joystreamstats.live`
		* `keralalivestream.com`
* 2 August
	* Average `wait` time: 921.780 ms
	* Sum `wait` time: 920858.344 ms
	* Average `time`: 1266.538 ms
	* Sum `time`: 1265271.502 ms
	* Other stats:
		* 0 responses >1m
		* ~25 responses >10s
		* 0 responses >30s
		* ~75% of responses <1s
	* Slow providers (these servers had response times >10s for at least 5 responses each):
		* `ru.joystreamstats.live`
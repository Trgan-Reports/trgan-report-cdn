$(document).ready((function ()
{
	$.fn.dataTable.isDataTable("#status") && $("#status").DataTable().destroy();
	const a = $("#status").DataTable(
	{
		autoWidth: !1,
		orderCellsTop: !0,
		fixedHeader: !0,
		lengthMenu: [
			[-1, 10, 25, 50],
			["All", 10, 25, 50]
		],
		pageLength: -1
	});
	$("#status thead tr:eq(1) th").each((function (t)
	{
		$("input", this).on("keyup change", (function ()
		{
			a.column(t).search() !== this.value && a.column(t).search(this.value).draw()
		}))
	})), $(".filter-row, .dataTables_info, .dataTables_paginate, .dataTables_length, .dataTables_filter").hide(), $("#toggleFilters").on("click", (function ()
	{
		$(".filter-row, .dataTables_info, .dataTables_paginate, .dataTables_length, .dataTables_filter").toggle()
	}))
}));

function getCompressedBase64(e)
{
	return JSON.parse(document.getElementById("screenshot-data").textContent)[e] || ""
}

function decodeBase64(e)
{
	let t = e.replace(/\s+/g, "").replace(/-/g, "+").replace(/_/g, "/");
	const n = t.length % 4;
	n && (t += "=".repeat(4 - n));
	const o = atob(t),
		l = new Uint8Array(o.length);
	for (let e = 0; e < o.length; e++) l[e] = o.charCodeAt(e);
	return l
}

function inflateToBlobUrl(e)
{
	const t = pako.inflateRaw(e),
		n = new Blob([t],
		{
			type: "image/png"
		});
	return URL.createObjectURL(n)
}

function toggleThumbnail(e)
{
	const t = document.getElementById(`thumbContainer${e}`),
		n = document.getElementById(`thumbImg${e}`),
		o = document.getElementById(`btnIcon${e}`),
		l = document.getElementById(`tooltipLabel${e}`);
	if ("none" === t.style.display)
	{
		if (t.style.display = "block", !n.src)
		{
			const e = decodeBase64(getCompressedBase64(t.dataset.compressed));
			n.src = inflateToBlobUrl(e), n.onload = () => n.classList.add("loaded")
		}
		o.textContent = "#", l.textContent = "Hide Screenshot"
	}
	else t.style.display = "none", o.textContent = "⧉", l.textContent = "Open Screenshot"
}

function openFullImage(e, t, n)
{
	const o = document.getElementById(`thumbImg${n}`),
		l = document.getElementById(e);
	document.getElementById(t).src = o.src, l.style.display = "block"
}

function closeModal(e, t)
{
	const n = document.getElementById(e),
		o = document.getElementById(`thumbContainer${t}`),
		l = document.getElementById(`btnIcon${t}`),
		c = document.getElementById(`tooltipLabel${t}`);
	n.style.display = "none", o.style.display = "none", l.textContent = "⧉", c.textContent = "Open Screenshot"
}
document.addEventListener("keydown", (function (e)
{
	if ("Escape" === e.key)
	{
		document.querySelectorAll('[id^="imageModal"]').forEach((e =>
		{
			if ("block" === e.style.display)
			{
				const t = e.id,
					n = t.replace("imageModal", "");
				closeModal(t, parseInt(n))
			}
		}))
	}
}));

function expandLogs(s)
{
	const e = s.nextElementSibling,
		o = s.closest(".step"),
		t = s.querySelector(".step-arrow"),
		n = o.classList.contains("expanded");
	"none" === e.style.display ? t.classList.add("open") : t.classList.remove("open"), e.style.display = n ? "none" : "block", n || e.scrollIntoView(
	{
		behavior: "smooth",
		block: "start"
	}), o.classList.toggle("expanded", !n)
}
const testSummaryData = window.testSummaryData || [],
	testBlockSummaryData = window.testBlockSummaryData || [],
	stepSummaryData = window.stepSummaryData || [],
	chartIds = ["chart-slide-0", "chart-slide-1", "chart-slide-2"],
	canvasIds = ["testSummaryChart", "testBlockSummaryChart", "stepSummaryChart"],
	chartDataSets = [testSummaryData, testBlockSummaryData, stepSummaryData],
	chartsInitialized = {
		testSummaryChart: !1,
		testBlockSummaryChart: !1,
		stepSummaryChart: !1
	},
	prepareChartPayload = t =>
	{
		const a = t.find((t => "Total" === t.label)) ||
			{},
			e = t.filter((t => "Total" !== t.label));
		return {
			labels: e.map((t => `${t.label} ${t.count}`)),
			values: e.map((t => t.count)),
			colors: e.map((t => t.color)),
			total: a.count || 0,
			totalColor: a.color || "#34495e"
		}
	},
	renderPieChart = (t, a) =>
	{
		const e = document.getElementById(t).getContext("2d"),
			{
				labels: l,
				values: o,
				colors: r,
				total: s,
				totalColor: n
			} = prepareChartPayload(a);
		new Chart(e,
		{
			type: "pie",
			data:
			{
				labels: l,
				datasets: [
				{
					data: o,
					backgroundColor: r,
					borderWidth: 1
				}]
			},
			options:
			{
				responsive: !1,
				maintainAspectRatio: !1,
				plugins:
				{
					legend:
					{
						position: "right",
						align: "end",
						labels:
						{
							font:
							{
								size: 10
							},
							boxWidth: 15,
							generateLabels: t =>
							{
								const a = t.data.datasets[0];
								return t.data.labels.map(((t, e) => (
								{
									text: t,
									fillStyle: a.backgroundColor[e],
									hidden: !1,
									index: e
								}))).concat(
								{
									text: `Total: ${s}`,
									fillStyle: n,
									hidden: !1,
									index: -1
								})
							}
						}
					},
					tooltip:
					{
						callbacks:
						{
							label: t =>
							{
								const a = t.raw || 0,
									e = (a / s * 100).toFixed(1);
								return `${t.label}: ${a} (${e}%)`
							}
						}
					}
				},
				layout:
				{
					padding:
					{
						right: 20,
						bottom: 20
					}
				}
			}
		})
	},
	initializeChartOnce = (t, a) =>
	{
		const e = document.getElementById(t);
		0 === e.offsetWidth || 0 === e.offsetHeight || chartsInitialized[t] || (renderPieChart(t, a), chartsInitialized[t] = !0)
	},
	showChart = t =>
	{
		chartIds.forEach(((a, e) =>
		{
			document.getElementById(a).style.display = e === t ? "block" : "none", e === t && initializeChartOnce(canvasIds[e], chartDataSets[e])
		})), document.querySelectorAll(".dot").forEach(((a, e) => a.classList.toggle("active", e === t)))
	};
const toggleSummaryPanel = () =>
{
	const e = document.getElementById("summaryPanel"),
		t = document.getElementById("inline-summary"),
		n = document.getElementById("chart-toggle"),
		l = "none" !== e.style.display;
	e.style.display = l ? "none" : "flex", t.style.display = l ? "block" : "none", n.textContent = l ? "📊" : "❌", l ? (n.title = "Show Charts", n.style.opacity = 1) : (n.title = "Hide Charts", n.style.opacity = .5), l || (Index = 0, showChart(Index))
};
document.querySelectorAll('.gherkin').forEach(span =>
{
	if (span.textContent.trim() !== '')
	{
		span.style.width = '45px';
	}
	else
	{
		span.style.width = '0';
	}
});

function toggleSection1(e)
{
	const t = e.nextElementSibling,
		s = e.closest(".test-summary"),
		l = e.querySelector(".arrow"),
		o = s.classList.contains("expanded");
	"none" === t.style.display ? l.classList.add("open") : l.classList.remove("open"), t.style.display = o ? "none" : "block", o || t.scrollIntoView(
	{
		behavior: "smooth",
		block: "start"
	}), s.classList.toggle("expanded", !o)
}
document.querySelectorAll(".test-block").forEach((e =>
{
	const t = e.querySelector(".test-details"),
		s = e.querySelector(".arrow"),
		l = e.querySelector(".test-summary");
	t && t.textContent.trim().length > 0 ? (s.setAttribute("title", "Click to expand"), s.style.pointerEvents = "auto") : (s.removeAttribute("title"), s.style.opacity = "0", s.style.pointerEvents = "none", l && (l.onclick = null, l.style.cursor = "default", l.style.pointerEvents = "none"))
})), document.querySelectorAll(".step").forEach((e =>
{
	const t = e.querySelector(".step-arrow"),
		s = e.querySelector(".description"),
		l = e.nextElementSibling,
		o = l?.classList.contains("log") && l.innerText.trim().length > 0;
	t && (o ? (e.classList.add("has-log"), t.setAttribute("title", "See logs"), s.setAttribute("title", "See logs"), s.style.cursor = "pointer", s.style.pointerEvents = "auto") : (s.onclick = null, e.classList.remove("has-log"), t.removeAttribute("title"), t.style.cursor = "default", t.style.pointerEvents = "none"))
}));
const table = document.getElementById("trgan-report");
if (table)
{
	table.querySelectorAll("th").forEach((e =>
	{
		const t = e.querySelector(".resizer");
		t && t.addEventListener("mousedown", (function (t)
		{
			t.preventDefault();
			const n = t.pageX,
				o = e.offsetWidth,
				r = t =>
				{
					const r = o + (t.pageX - n);
					e.style.width = r + "px"
				},
				s = () =>
				{
					document.removeEventListener("mousemove", r), document.removeEventListener("mouseup", s)
				};
			document.addEventListener("mousemove", r), document.addEventListener("mouseup", s)
		}))
	}))
}
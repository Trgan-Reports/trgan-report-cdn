  $(document).ready(function () {
      if ($.fn.dataTable.isDataTable('#status')) {
      $('#status').DataTable().destroy();
    }
    const table = $('#status').DataTable({
      autoWidth: false,
      orderCellsTop: true,
      fixedHeader: true
    });
    $('#status thead tr:eq(1) th').each(function (i) {
      $('input', this).on('keyup change', function () {
        if (table.column(i).search() !== this.value) {
          table.column(i).search(this.value).draw();
        }
      });
    });
    $('.filter-row, .dataTables_info, .dataTables_paginate, .dataTables_length, .dataTables_filter').hide();
    $('#toggleFilters').on('click', function () {
      $('.filter-row, .dataTables_info, .dataTables_paginate, .dataTables_length, .dataTables_filter').toggle();
    });
  });
function getCompressedBase64(id) {
  const map = JSON.parse(
    document.getElementById('screenshot-data').textContent
  );
  return map[id] || '';
}

function decodeBase64(b64) {
  let s = b64.replace(/\s+/g, '')
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const pad = s.length % 4;
  if (pad) s += '='.repeat(4 - pad);
  const bin = atob(s);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    arr[i] = bin.charCodeAt(i);
  }
  return arr;
}

function inflateToBlobUrl(deflatedBytes) {
  const jpegBytes = pako.inflateRaw(deflatedBytes);
  const blob = new Blob([jpegBytes], { type: 'image/png' });
  return URL.createObjectURL(blob);
}

function toggleThumbnail(index) {
  const container = document.getElementById(`thumbContainer${index}`);
  const img = document.getElementById(`thumbImg${index}`);
  const btnIcon = document.getElementById(`btnIcon${index}`);
  const tooltip = document.getElementById(`tooltipLabel${index}`);
  const isHidden = container.style.display === 'none';

  if (isHidden) {
    container.style.display = 'block';
    if (!img.src) {
      const id = container.dataset.compressed;
      const b64 = getCompressedBase64(id);
      const deflated = decodeBase64(b64);
      img.src = inflateToBlobUrl(deflated);
      img.onload = () => img.classList.add('loaded');
    }
    btnIcon.textContent = '#';
    tooltip.textContent = 'Hide Screenshot';
  }
  else {
    container.style.display = 'none';
    btnIcon.textContent = '⧉';
    tooltip.textContent = 'Open Screenshot';
  }
}

function openFullImage(modalId, imgId, index) {
  const thumbImg = document.getElementById(`thumbImg${index}`);
  const modal = document.getElementById(modalId);
  const fullImg = document.getElementById(imgId);
  fullImg.src = thumbImg.src;
  modal.style.display = 'block';
}

function closeModal(modalId, index) {
  const modal = document.getElementById(modalId);
  const thumb = document.getElementById(`thumbContainer${index}`);
  const btnIcon = document.getElementById(`btnIcon${index}`);
  const tooltip = document.getElementById(`tooltipLabel${index}`);
  modal.style.display = 'none';
  thumb.style.display = 'none';
  btnIcon.textContent = '⧉';
  tooltip.textContent = 'Open Screenshot';
}
function expandLogs(element) {
  const logs = element.nextElementSibling;
  const block = element.closest('.step');
  const arrow = element.querySelector('.step-arrow');
  const isExpanded = block.classList.contains('expanded');
  if (logs.style.display === 'none') {
    arrow.classList.add('open');
  } else {
    arrow.classList.remove('open');
  }
  logs.style.display = isExpanded ? 'none' : 'block';
  if (!isExpanded) { logs.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  block.classList.toggle('expanded', !isExpanded);
}
const testSummaryData = window.testSummaryData || [];
const testBlockSummaryData = window.testBlockSummaryData || [];
const stepSummaryData = window.stepSummaryData || [];

const chartIds = ['chart-slide-0', 'chart-slide-1', 'chart-slide-2'];
const canvasIds = ['testSummaryChart', 'testBlockSummaryChart', 'stepSummaryChart'];
const chartDataSets = [testSummaryData, testBlockSummaryData, stepSummaryData];
const chartsInitialized = {
    testSummaryChart: false, testBlockSummaryChart: false, stepSummaryChart: false
};

const prepareChartPayload = data => {
    const totalEntry = data.find(d => d.label === 'Total') || {}; const chartData = data.filter(d => d.label !== 'Total'); return {
        labels: chartData.map(d => `${d.label} ${d.count}`),
        values: chartData.map(d => d.count),
        colors: chartData.map(d => d.color),
        total: totalEntry.count || 0,
        totalColor: totalEntry.color || '#34495e'
    };
};

const renderPieChart = (canvasId, data) => {
    const ctx = document.getElementById(canvasId).getContext('2d'); const { labels, values, colors, total, totalColor } = prepareChartPayload(data);
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels, datasets: [{ data: values, backgroundColor: colors, borderWidth: 1 }]
        },
        options: {
            responsive: false, maintainAspectRatio: false, plugins: {
                legend: {
                    position: 'right', align: 'end', labels: {
                        font: { size: 10 },
                        boxWidth: 15,
                        generateLabels: chart => {
                            const dataset = chart.data.datasets[0]; return chart.data.labels.map((label, i) => ({
                                text: label,
                                fillStyle: dataset.backgroundColor[i],
                                hidden: false,
                                index: i
                            })).concat({
                                text: `Total: ${total}`,
                                fillStyle: totalColor,
                                hidden: false,
                                index: -1
                            });
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: ctx => {
                            const value = ctx.raw || 0; const percent = ((value / total) * 100).toFixed(1); return `${ctx.label}: ${value} (${percent}%)`;
                        }
                    }
                }
            }, layout: { padding: { right: 20, bottom: 20 } }
        }
    });
};

const initializeChartOnce = (canvasId, data) => {
    const canvas = document.getElementById(canvasId); if (canvas.offsetWidth === 0 || canvas.offsetHeight === 0 || chartsInitialized[canvasId]) return; renderPieChart(canvasId, data); chartsInitialized[canvasId] = true;
};

const showChart = index => {
    chartIds.forEach((id, i) => {
        const slide = document.getElementById(id);
        slide.style.display = i === index ? 'block' : 'none';
        if (i === index) initializeChartOnce(canvasIds[i], chartDataSets[i]);
    }); document.querySelectorAll('.dot').forEach((dot, i) =>
        dot.classList.toggle('active', i === index));
};const toggleSummaryPanel = () => {
    const panel = document.getElementById('summaryPanel');
    const metaLine = document.getElementById('inline-summary');
    const toggle = document.getElementById('chart-toggle');
    const isVisible = panel.style.display !== 'none';
    panel.style.display = isVisible ? 'none' : 'flex';
    metaLine.style.display = isVisible ? 'block' : 'none';
    toggle.textContent = isVisible ? '📊' : '❌';
    if(isVisible){
    toggle.title ='Show Charts';
    toggle.style.opacity=1;
    }
    else{
    toggle.title ='Hide Charts';
    toggle.style.opacity=0.5;
    }
    if (!isVisible) {
Index = 0;
showChart(Index);
    }
};function toggleSection1(element) {
  const details = element.nextElementSibling;
  const block = element.closest('.test-summary');
  const arrow = element.querySelector('.arrow');
  const isExpanded = block.classList.contains('expanded');
  if (details.style.display === 'none') {
    arrow.classList.add('open');
  } else {
    arrow.classList.remove('open');
  }
  details.style.display = isExpanded ? 'none' : 'block';
  if (!isExpanded) { details.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  block.classList.toggle('expanded', !isExpanded);
}

document.querySelectorAll('.test-block').forEach(block => {
  const details = block.querySelector('.test-details');
  const arrow = block.querySelector('.arrow');
  const summary = block.querySelector('.test-summary');

  const hasContent = details && details.textContent.trim().length > 0;

  if (hasContent) {
    arrow.setAttribute('title', 'Click to expand');
    arrow.style.pointerEvents = 'auto';
  } else {
    arrow.removeAttribute('title');
    arrow.style.opacity = '0';
    arrow.style.pointerEvents = 'none';

    if (summary) {
      summary.onclick = null;
      summary.style.cursor = 'default';
      summary.style.pointerEvents = 'none';
    }
  }
});


document.querySelectorAll('.step').forEach(step => {
  const arrow = step.querySelector('.step-arrow');
  const description = step.querySelector('.description');
  const log = step.nextElementSibling;

  const hasLog = log?.classList.contains('log') && log.innerText.trim().length > 0;

  if (arrow) {
    if (hasLog) {
      step.classList.add('has-log');
      arrow.setAttribute('title', 'See logs');
      description.setAttribute('title', 'See logs');
      description.style.cursor = 'pointer';
      description.style.pointerEvents = 'auto';
    } else {
      description.onclick = null;
      step.classList.remove('has-log');
      arrow.removeAttribute('title');
      arrow.style.cursor = 'default';
      arrow.style.pointerEvents = 'none';
    }
  }
});const table = document.getElementById("trgan-report");

if (table) {
  const thElements = table.querySelectorAll("th");

  thElements.forEach((th) => {
    const resizer = th.querySelector(".resizer");
    if (!resizer) return;

    resizer.addEventListener("mousedown", function (e) {
      e.preventDefault();
      const startX = e.pageX;
      const startWidth = th.offsetWidth;

      const onMouseMove = (e) => {
        const newWidth = startWidth + (e.pageX - startX);
        th.style.width = newWidth + "px";
      };

      const onMouseUp = () => {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      };

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    });
  });
}

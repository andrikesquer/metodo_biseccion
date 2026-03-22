let chartInstance = null;

function setPreset(fn, a, b) {
    document.getElementById("fx").value = fn;
    document.getElementById("xa").value = a;
    document.getElementById("xb").value = b;
}

function evalF(expr, x) {
    return math.evaluate(expr, { x });
}

function showError(msg) {
    const el = document.getElementById("error");
    el.textContent = "⚠  " + msg;
    el.style.display = "block";
    document.getElementById("results").style.display = "none";
}

function hideError() {
    document.getElementById("error").style.display = "none";
}

function fmt(v, d = 6) {
    if (!isFinite(v)) return "—";
    return parseFloat(v.toFixed(d)).toString();
}

function run() {
    hideError();
    const expr = document.getElementById("fx").value.trim();
    const xa0 = parseFloat(document.getElementById("xa").value);
    const xb0 = parseFloat(document.getElementById("xb").value);
    const tol = parseFloat(document.getElementById("tol").value);
    const maxIter = parseInt(document.getElementById("maxiter").value);

    if (!expr) return showError("Ingresa una función f(x).");
    if (isNaN(xa0) || isNaN(xb0))
        return showError("Los límites del intervalo no son válidos.");
    if (xa0 >= xb0) return showError("xa debe ser menor que xb.");

    let fxa0, fxb0;
    try {
        fxa0 = evalF(expr, xa0);
        fxb0 = evalF(expr, xb0);
    } catch (e) {
        return showError(
            "No se pudo evaluar la función. Revisa la sintaxis. Usa * para multiplicar y ^ para potencias.",
        );
    }

    if (fxa0 * fxb0 > 0) {
        return showError(
            `No hay cambio de signo en [${xa0}, ${xb0}]. f(${xa0}) = ${fmt(fxa0, 4)}, f(${xb0}) = ${fmt(fxb0, 4)}. Ajusta el intervalo.`,
        );
    }

    // ── Bisection ──
    let xa = xa0,
        xb = xb0;
    let xrPrev = null;
    const rows = [];

    for (let i = 1; i <= maxIter; i++) {
        const xr = (xa + xb) / 2;
        const fxa = evalF(expr, xa);
        const fxb = evalF(expr, xb);
        const fxr = evalF(expr, xr);
        const prod = fxa * fxr;
        const ep =
            xrPrev !== null ? Math.abs((xr - xrPrev) / xr) * 100 : null;

        rows.push({ i, xa, xb, fxa, fxb, xr, fxr, prod, ep });

        if (prod < 0) xb = xr;
        else xa = xr;
        xrPrev = xr;

        if (ep !== null && ep < tol) break;
    }

    const last = rows[rows.length - 1];

    // ── Stats ──
    document.getElementById("r-root").textContent = fmt(last.xr, 7);
    document.getElementById("r-fxr").textContent =
        `f(xr) = ${fmt(last.fxr, 7)}`;
    document.getElementById("r-ep").textContent =
        last.ep !== null ? fmt(last.ep, 4) + "%" : "—";
    document.getElementById("r-iters").textContent =
        `${rows.length} iteración${rows.length > 1 ? "es" : ""}`;

    // ── Chart ──
    buildChart(expr, xa0, xb0, last.xr);

    // ── Convergence bars ──
    const epRows = rows.filter((r) => r.ep !== null);
    const maxEp = Math.max(...epRows.map((r) => r.ep), 1);
    const barsEl = document.getElementById("conv-bars");
    barsEl.innerHTML = epRows
        .map(
            (r) => `
    <div class="conv-row">
      <div class="conv-label">${r.i}</div>
      <div class="conv-track">
        <div class="conv-fill" style="width:${Math.min((r.ep / maxEp) * 100, 100).toFixed(1)}%"></div>
      </div>
      <div class="conv-val">${fmt(r.ep, 2)}%</div>
    </div>`,
        )
        .join("");

    // ── Table ──
    const tbody = document.getElementById("iter-table");
    tbody.innerHTML = rows
        .map((r, idx) => {
            const isLast = idx === rows.length - 1;
            const epStr = r.ep !== null ? fmt(r.ep, 4) : "—";
            const sign = (v) => (v < 0 ? "neg" : "pos");
            return `<tr class="${isLast ? "converged" : ""}">
      <td class="iter-num">${r.i}</td>
      <td>${fmt(r.xa, 5)}</td>
      <td>${fmt(r.xb, 5)}</td>
      <td class="${sign(r.fxa)}">${fmt(r.fxa, 4)}</td>
      <td class="${sign(r.fxb)}">${fmt(r.fxb, 4)}</td>
      <td><strong>${fmt(r.xr, 6)}</strong></td>
      <td class="${sign(r.fxr)}">${fmt(r.fxr, 4)}</td>
      <td class="${r.prod < 0 ? "neg" : "pos"}">${fmt(r.prod, 4)}</td>
      <td>${epStr}</td>
    </tr>`;
        })
        .join("");

    document.getElementById("results").style.display = "block";
    document
        .getElementById("results")
        .scrollIntoView({ behavior: "smooth", block: "start" });
}

function buildChart(expr, xa0, xb0, root) {
    const range = xb0 - xa0;
    const margin = range * 1.5;
    const xMin = xa0 - margin;
    const xMax = xb0 + margin;
    const steps = 400;
    const dx = (xMax - xMin) / steps;

    const labels = [],
        dataY = [];
    for (let i = 0; i <= steps; i++) {
        const x = xMin + i * dx;
        labels.push(parseFloat(x.toFixed(4)));
        try {
            const y = evalF(expr, x);
            dataY.push(
                isFinite(y) && Math.abs(y) < 1e8
                    ? parseFloat(y.toFixed(6))
                    : null,
            );
        } catch {
            dataY.push(null);
        }
    }

    // Zero line data
    const zeroData = labels.map(() => 0);

    if (chartInstance) chartInstance.destroy();

    const ctx = document.getElementById("chart").getContext("2d");
    chartInstance = new Chart(ctx, {
        type: "line",
        data: {
            labels,
            datasets: [
                {
                    label: "f(x)",
                    data: dataY,
                    borderColor: "#00d4ff",
                    borderWidth: 2.5,
                    pointRadius: 0,
                    tension: 0.3,
                    fill: false,
                    spanGaps: false,
                },
                {
                    label: "y = 0",
                    data: zeroData,
                    borderColor: "rgba(255,255,255,0.15)",
                    borderWidth: 1,
                    pointRadius: 0,
                    borderDash: [6, 4],
                    fill: false,
                },
                {
                    label: `Raíz ≈ ${parseFloat(root.toFixed(5))}`,
                    data: [{ x: root, y: 0 }],
                    type: "scatter",
                    backgroundColor: "#ff6b35",
                    pointRadius: 9,
                    pointHoverRadius: 11,
                    borderColor: "#fff",
                    borderWidth: 2,
                    showLine: false,
                },
            ],
        },
        options: {
            responsive: true,
            animation: { duration: 600 },
            interaction: { mode: "index", intersect: false },
            plugins: {
                legend: {
                    labels: {
                        color: "#5a7a99",
                        font: { family: "'IBM Plex Mono'", size: 12 },
                    },
                },
                tooltip: {
                    backgroundColor: "#111820",
                    borderColor: "#1e3048",
                    borderWidth: 1,
                    titleColor: "#00d4ff",
                    bodyColor: "#c8d8e8",
                    titleFont: { family: "'IBM Plex Mono'" },
                    bodyFont: { family: "'IBM Plex Mono'" },
                },
            },
            scales: {
                x: {
                    type: "linear",
                    grid: { color: "rgba(30,48,72,0.6)" },
                    ticks: {
                        color: "#5a7a99",
                        font: { family: "'IBM Plex Mono'", size: 11 },
                        maxTicksLimit: 10,
                    },
                    border: { color: "#1e3048" },
                },
                y: {
                    grid: { color: "rgba(30,48,72,0.6)" },
                    ticks: {
                        color: "#5a7a99",
                        font: { family: "'IBM Plex Mono'", size: 11 },
                    },
                    border: { color: "#1e3048" },
                },
            },
        },
    });
}

// Run on load with default values
window.addEventListener("load", () => setTimeout(run, 300));

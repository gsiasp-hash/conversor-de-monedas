let rates = {};
let chart;

const indicatorMap = {
  USD: "dolar",
  EUR: "euro",
  GBP: "libra_cobre",
  BTC: "bitcoin",
};

function updateChart(currency) {
  const indicator = indicatorMap[currency];
  const currentYear = 2026;
  fetch(`https://mindicador.cl/api/${indicator}/${currentYear}`)
    .then((response) => response.json())
    .then((data) => {
      if (!data.serie || data.serie.length === 0) {
        console.log("No hay datos de esa fecha para ", currency);
        return;
      }
      const serie = data.serie
        .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
        .slice(-30);
      const labels = serie.map((item) => item.fecha.split("T")[0]);
      const values = serie.map((item) => item.valor);
      if (chart) {
        chart.destroy();
      }
      chart = new Chart(document.getElementById("chart"), {
        type: "line",
        data: {
          labels: labels,
          datasets: [
            {
              label: `Valor de ${currency} en CLP`,
              data: values,
              borderColor: "rgba(75, 192, 192, 1)",
              backgroundColor: "rgba(75, 192, 192, 0.2)",
              fill: true,
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            x: {
              display: true,
              title: {
                display: true,
                text: "Fecha",
              },
            },
            y: {
              display: true,
              title: {
                display: true,
                text: "Valor en CLP",
              },
            },
          },
        },
      });
    })
    .catch((error) => {
      console.log("Error obteniendo los datos:");
    });
}

fetch("https://mindicador.cl/api")
  .then((response) => response.json())
  .then((data) => {
    rates = {
      USD: data.dolar.valor,
      EUR: data.euro.valor,
      GBP: data.libra_cobre.valor,
      BTC: data.bitcoin.valor,
    };
    updateChart("USD");
  })
  .catch((error) => {
    console.log("Error fetching rates:", error);
  });

document
  .getElementById("currencySelect")
  .addEventListener("change", (event) => {
    const currency = event.target.value;
    updateChart(currency);
  });

document.getElementById("convertButton").addEventListener("click", () => {
  const amount = parseFloat(document.getElementById("pesosInput").value);
  const currency = document.getElementById("currencySelect").value;
  const resultElement = document.getElementById("result");

  if (isNaN(amount) || amount <= 0) {
    resultElement.textContent = "Por favor ingrese una cantidad válida.";
    return;
  }

  if (!rates[currency]) {
    resultElement.textContent = "Moneda no disponible.";
    return;
  }

  const converted = amount / rates[currency];
  resultElement.textContent = `${amount} CLP = ${converted.toFixed(2)} ${currency}`;
});

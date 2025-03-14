
const tooltip = d3
  .select("body")
  .append("div")
  .attr("class", "tooltip");


/*Load cleaned.csv*/
d3.csv("cleaned.csv").then((fullData) => {
  console.log("Rows loaded:", fullData.length);
  if (fullData.length > 0) {
    console.log("First row:", fullData[0]);
    console.log("Columns:", Object.keys(fullData[0]));
  }

/*chart 1*/
  const data1 = [...fullData]
    .sort((a, b) => d3.descending(+a["Quarterly Total_Q1"], +b["Quarterly Total_Q1"]))
    .slice(0, 10);


  const margin1 = { top: 30, right: 30, bottom: 100, left: 80 },
        width1  = 600 - margin1.left - margin1.right,
        height1 = 400 - margin1.top - margin1.bottom;


  const svg1 = d3.select("#viz1")
    .append("svg")
    .attr("class", "chart-svg")
    .attr("width", width1 + margin1.left + margin1.right)
    .attr("height", height1 + margin1.top + margin1.bottom)
    .append("g")
    .attr("transform", `translate(${margin1.left},${margin1.top})`);

  // X scale -> School names
  const x1 = d3.scaleBand()
    .domain(data1.map(d => d.School))
    .range([0, width1])
    .padding(0.2);

  // Y scale -> Q1 totals
  const y1 = d3.scaleLinear()
    .domain([0, d3.max(data1, d => +d["Quarterly Total_Q1"]) || 0])
    .range([height1, 0]);

  // Axes
  svg1.append("g")
      .attr("transform", `translate(0,${height1})`)
      .call(d3.axisBottom(x1))
      .selectAll("text")
      .attr("transform", "translate(0,10)rotate(-45)")
      .style("text-anchor", "end");

  svg1.append("g")
      .call(d3.axisLeft(y1));

  // Bars
  svg1.selectAll("rect")
      .data(data1)
      .join("rect")
      .attr("x", d => x1(d.School))
      .attr("y", d => y1(+d["Quarterly Total_Q1"]))
      .attr("width", x1.bandwidth())
      .attr("height", d => height1 - y1(+d["Quarterly Total_Q1"]))
      .attr("fill", "#69b3a2")
      .on("mouseover", (event, d) => {
        tooltip.style("opacity", 1)
               .html(`School: ${d.School}<br>Q1 Total: ${d["Quarterly Total_Q1"]}`);
      })
      .on("mousemove", (event) => {
        tooltip
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY + "px");
      })
      .on("mouseout", () => {
        tooltip.style("opacity", 0);
      });


/*chart 2*/
  // Sum each quarter across all schools
  const sumQ1 = d3.sum(fullData, d => +d["Quarterly Total_Q1"]);
  const sumQ2 = d3.sum(fullData, d => +d["Quarterly Total_Q2"]);
  const sumQ3 = d3.sum(fullData, d => +d["Quarterly Total_Q3"]);
  const sumQ4 = d3.sum(fullData, d => +d["Quarterly Total_Q4"]);
  const sumQ5 = d3.sum(fullData, d => +d["Quarterly Total_Q5"]);

  // Build an array for the line
  const data2 = [
    { quarter: 1, total: sumQ1 },
    { quarter: 2, total: sumQ2 },
    { quarter: 3, total: sumQ3 },
    { quarter: 4, total: sumQ4 },
    { quarter: 5, total: sumQ5 },
  ];

  // Dimensions
  const margin2 = { top: 30, right: 30, bottom: 50, left: 60 },
        width2  = 600 - margin2.left - margin2.right,
        height2 = 400 - margin2.top - margin2.bottom;

  const svg2 = d3.select("#viz2")
    .append("svg")
    .attr("class", "chart-svg")
    .attr("width", width2 + margin2.left + margin2.right)
    .attr("height", height2 + margin2.top + margin2.bottom)
    .append("g")
    .attr("transform", `translate(${margin2.left},${margin2.top})`);

  // X scale: quarters 1..5
  const x2 = d3.scaleLinear()
    .domain([1, 5])
    .range([0, width2]);

  // Y scale: total
  const y2 = d3.scaleLinear()
    .domain([0, d3.max(data2, d => d.total) || 0])
    .range([height2, 0]);

  // Axes
  svg2.append("g")
      .attr("transform", `translate(0,${height2})`)
      .call(d3.axisBottom(x2).ticks(5).tickFormat(d => `Q${d}`));

  svg2.append("g").call(d3.axisLeft(y2));

  // Line generator
  const line2 = d3.line()
    .x(d => x2(d.quarter))
    .y(d => y2(d.total));

  // Draw line
  svg2.append("path")
      .datum(data2)
      .attr("fill", "none")
      .attr("stroke", "#ff7f0e")
      .attr("stroke-width", 2)
      .attr("d", line2);

  // Circles + tooltip
  svg2.selectAll("circle")
      .data(data2)
      .join("circle")
      .attr("cx", d => x2(d.quarter))
      .attr("cy", d => y2(d.total))
      .attr("r", 4)
      .attr("fill", "#ff7f0e")
      .on("mouseover", (event, d) => {
        tooltip.style("opacity", 1)
               .html(`Quarter: Q${d.quarter}<br>Total: ${d.total}`);
      })
      .on("mousemove", (event) => {
        tooltip
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY + "px");
      })
      .on("mouseout", () => {
        tooltip.style("opacity", 0);
      });


/*chart 3*/
  const data3 = fullData.map(d => ({
    dep: +d["Dependent Students_Q1"],
    ind: +d["Independent Students_Q1"],
  })).filter(d => !isNaN(d.dep) && !isNaN(d.ind));

  const margin3 = { top: 30, right: 30, bottom: 50, left: 60 },
        width3  = 600 - margin3.left - margin3.right,
        height3 = 400 - margin3.top - margin3.bottom;

  const svg3 = d3.select("#viz3")
    .append("svg")
    .attr("class", "chart-svg")
    .attr("width", width3 + margin3.left + margin3.right)
    .attr("height", height3 + margin3.top + margin3.bottom)
    .append("g")
    .attr("transform", `translate(${margin3.left},${margin3.top})`);

  const x3 = d3.scaleLinear()
    .domain([0, d3.max(data3, d => d.dep) || 0])
    .range([0, width3]);

  const y3 = d3.scaleLinear()
    .domain([0, d3.max(data3, d => d.ind) || 0])
    .range([height3, 0]);

  // Axes
  svg3.append("g")
      .attr("transform", `translate(0,${height3})`)
      .call(d3.axisBottom(x3));
  svg3.append("g").call(d3.axisLeft(y3));

  // Points
  svg3.selectAll("circle")
      .data(data3)
      .join("circle")
      .attr("cx", d => x3(d.dep))
      .attr("cy", d => y3(d.ind))
      .attr("r", 5)
      .attr("fill", "#1f77b4")
      .on("mouseover", (event, d) => {
        tooltip.style("opacity", 1)
               .html(`Dep: ${d.dep}<br>Ind: ${d.ind}`);
      })
      .on("mousemove", (event) => {
        tooltip
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY + "px");
      })
      .on("mouseout", () => {
        tooltip.style("opacity", 0);
      });


/*chart 4*/
  // Group by School Type, sum Q1
  const rollup4 = d3.rollups(
    fullData,
    v => d3.sum(v, d => +d["Quarterly Total_Q1"]),
    d => d["School Type"]
  );
  // Convert to array of objects for pie
  const data4 = rollup4.map(([type, total]) => ({ type, total }));
  console.log("Chart 4 data:", data4);

  const margin4 = 20,
        width4  = 400,
        height4 = 400,
        radius4 = Math.min(width4, height4) / 2 - margin4;

  const svg4 = d3.select("#viz4")
    .append("svg")
    .attr("class", "chart-svg")
    .attr("width", width4)
    .attr("height", height4)
    .append("g")
    .attr("transform", `translate(${width4 / 2},${height4 / 2})`);

  const color4 = d3.scaleOrdinal(d3.schemeCategory10);

  const pie4 = d3.pie()
    .sort(null)
    .value(d => d.total);

  const arc4 = d3.arc()
    .innerRadius(70) // donut hole size
    .outerRadius(radius4);

  const arcs4 = pie4(data4);

  svg4.selectAll("path")
      .data(arcs4)
      .join("path")
      .attr("d", arc4)
      .attr("fill", d => color4(d.data.type))
      .on("mouseover", (event, d) => {
        tooltip.style("opacity", 1)
               .html(`Type: ${d.data.type}<br>Q1 Total: ${d.data.total}`);
      })
      .on("mousemove", (event) => {
        tooltip
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY + "px");
      })
      .on("mouseout", () => {
        tooltip.style("opacity", 0);
      });

  // Optional labels
  svg4.selectAll("text")
      .data(arcs4)
      .join("text")
      .attr("transform", d => `translate(${arc4.centroid(d)})`)
      .attr("text-anchor", "middle")
      .style("fill", "#fff")
      .text(d => d.data.type);


/*chart 5*/
  // Sum across all schools for each quarter
  const depQ1 = d3.sum(fullData, d => +d["Dependent Students_Q1"]);
  const indQ1 = d3.sum(fullData, d => +d["Independent Students_Q1"]);
  const depQ2 = d3.sum(fullData, d => +d["Dependent Students_Q2"]);
  const indQ2 = d3.sum(fullData, d => +d["Independent Students_Q2"]);
  const depQ3 = d3.sum(fullData, d => +d["Dependent Students_Q3"]);
  const indQ3 = d3.sum(fullData, d => +d["Independent Students_Q3"]);
  const depQ4 = d3.sum(fullData, d => +d["Dependent Students_Q4"]);
  const indQ4 = d3.sum(fullData, d => +d["Independent Students_Q4"]);
  const depQ5 = d3.sum(fullData, d => +d["Dependent Students_Q5"]);
  const indQ5 = d3.sum(fullData, d => +d["Independent Students_Q5"]);

  const data5 = [
    { quarter: "Q1", dep: depQ1, ind: indQ1 },
    { quarter: "Q2", dep: depQ2, ind: indQ2 },
    { quarter: "Q3", dep: depQ3, ind: indQ3 },
    { quarter: "Q4", dep: depQ4, ind: indQ4 },
    { quarter: "Q5", dep: depQ5, ind: indQ5 },
  ];
  console.log("Chart 5 data:", data5);

  const subgroups = ["dep", "ind"];
  const groups = data5.map(d => d.quarter);

  const margin5 = { top: 30, right: 30, bottom: 50, left: 60 },
        width5  = 600 - margin5.left - margin5.right,
        height5 = 400 - margin5.top - margin5.bottom;

  const svg5 = d3.select("#viz5")
    .append("svg")
    .attr("class", "chart-svg")
    .attr("width", width5 + margin5.left + margin5.right)
    .attr("height", height5 + margin5.top + margin5.bottom)
    .append("g")
    .attr("transform", `translate(${margin5.left},${margin5.top})`);

  // X scale
  const x5 = d3.scaleBand()
    .domain(groups)
    .range([0, width5])
    .padding([0.2]);

  // Y scale
  const y5 = d3.scaleLinear()
    .domain([0, d3.max(data5, d => d.dep + d.ind) || 0])
    .range([height5, 0]);

  // Color scale for subgroups
  const color5 = d3.scaleOrdinal(d3.schemeSet2).domain(subgroups);

  // Stack the data
  const stackedData5 = d3.stack().keys(subgroups)(data5);

  // Draw stacked bars
  svg5.selectAll("g.layer")
    .data(stackedData5)
    .join("g")
    .attr("class", "layer")
    .attr("fill", d => color5(d.key))
    .selectAll("rect")
    .data(d => d)
    .join("rect")
    .attr("x", d => x5(d.data.quarter))
    .attr("y", d => y5(d[1]))
    .attr("height", d => y5(d[0]) - y5(d[1]))
    .attr("width", x5.bandwidth())
    .on("mouseover", function (event, d) {
      // Identify which subgroup we are in
      const subgroupName = d3.select(this.parentNode).datum().key;
      const value = d.data[subgroupName];
      tooltip
        .style("opacity", 1)
        .html(`Quarter: ${d.data.quarter}<br>${subgroupName}: ${value}`);
    })
    .on("mousemove", function (event) {
      tooltip
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY + "px");
    })
    .on("mouseout", function () {
      tooltip.style("opacity", 0);
    });

  // X Axis
  svg5.append("g")
    .attr("transform", `translate(0, ${height5})`)
    .call(d3.axisBottom(x5));

  // Y Axis
  svg5.append("g").call(d3.axisLeft(y5));
});

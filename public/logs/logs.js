getData();

async function getData() {
  const response = await fetch('/api');
  const data = await response.json();

  for (item of data) {
    const root = document.createElement('p');
    const geo = document.createElement('div');
    const date = document.createElement('div');
    const pointName = document.createElement('div');

    pointName.textContent = `Point: ${item.point_name}`;
    geo.textContent = `Coordinates: ${item.lat}°, ${item.lon}°`;
    const dateString = new Date(item.timestamp).toLocaleString();
    date.textContent = dateString;

    pointName.style.fontWeight = "900";
    pointName.style.fontFamily = "Courier New";
    geo.style.fontWeight = "900";
    geo.style.fontFamily = "Courier New";

    root.append(pointName,geo,date);
    document.body.append(root);
  }
  console.log(data);
}
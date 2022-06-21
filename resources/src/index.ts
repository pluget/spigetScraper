import { resolve } from "path";
import { writeFile } from "jsonfile";

const data: any[] = [];

async function fetchResources() {
  const data = [];
  for (let i = 0; i < 50; i++) {
    const fetched = await fetch(`https://api.spiget.org/v2/resources?size=2000&page=${i}`);

    const tempData = await fetched.json();
    data.push(...tempData);
  }
  return data;
}

fetchResources().then((res) => {
  const dir = resolve(process.cwd(), "../../scraperRepository/spigetResources.json");
  data.push(...res);
  writeFile(dir, data)
})

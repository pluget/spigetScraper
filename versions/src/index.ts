import { resolve } from "path";
import { readFile, writeFile } from "jsonfile";

async function getVersions() {
  const resourcesDir = resolve(
    process.cwd(),
    "../../scraperRepository/spigetResources.json"
  );
  const resources: { id?: number }[] = await readFile(resourcesDir);

  const data: Array<Object> = [];

  async function fetchWithRetries(url: string, retries = 12): Promise<any> {
    try {
      const response = await fetch(url);
      return await response.json();
    } catch (error) {
      if (retries > 0) {
        return fetchWithRetries(url, retries - 1);
      }
      console.log(error);
    }
  }

  for (let i = 0; i < resources.length; i += 50) {
    const requestsToAwait: Promise<Response>[] = [];
    const ids = [];

    const upperLimit = i + 50 > resources.length ? resources.length : i + 50;
    for (let j = i; j < upperLimit; j++) {
      try {
        ids.push(resources[j].id);
        requestsToAwait.push(
          fetchWithRetries(
            `https://api.spiget.org/v2/resources/${resources[j].id}/versions?size=2000`
          )
        );
      } catch (error) {
        console.log(error);
      }
      await setTimeout(() => {}, 50);
    }

    const requests = await Promise.all(requestsToAwait);
    for (let j = 0; j < requests.length; j++) {
      try {
        const versions = requests[j];
        data.push({ id: ids[j], versions });
      } catch (err) {
        console.error(err);
      }
    }
  }
  return data;
}

getVersions().then((data) => {
  const file = resolve(
    process.cwd(),
    "../../scraperRepository/spigetVersions.json"
  );
  writeFile(file, data);
});

import axios from "axios";

export async function getNgrokURL(): Promise<string> {
  const resp = await axios.get("http://ngrok:4040/api/tunnels");
  return resp.data.tunnels.find((i) => i.proto == "https").public_url;
}

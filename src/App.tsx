import { useEffect, useState } from "react"
import axios from "axios"
import { Stream } from "./components/Stream"
import { Client } from "./components/Client"

interface IDetail {
  server: string
  service: string
}

function App() {
  const [detail, setDetail] = useState<IDetail>()

  useEffect(() => {
    const fetchData = async () => {
      const detailResponse = await axios.get<IDetail>(`${import.meta.env.VITE_API_URL}/api/v1`)
      setDetail(detailResponse.data)
    }

    fetchData()
  }, [])

  return (
    <main>
      <div className="container">
        <h2>Server ID: {detail?.server}<br />Service ID: {detail?.service}</h2>
        <div className="box">
          <Stream />
          <Client />
        </div>
      </div>
    </main>
  )
}

export default App

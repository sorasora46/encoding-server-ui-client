import axios from "axios";
import { useEffect, useState } from "react";

interface IStreamingBit {
    recv_30s: number;
    send_30s: number;
}

interface IClient {
    alive: number;
    id: string;
    ip: string;
    kbps: IStreamingBit;
    name: string;
    pageUrl: string;
    publish: boolean;
    recv_bytes: number;
    send_bytes: number;
    stream: string;
    swfUrl: string;
    tcUrl: string;
    type: string;
    url: string;
    vhost: string;
}

interface IClientResponse {
    clients: IClient[]
}

export const Client = () => {
    const [clients, setClients] = useState<IClient[]>([]);
    const [isClickCopy, setIsClickCopy] = useState<boolean>(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const clientsResponse = await axios.get<IClientResponse>("http://192.168.1.6:1985/api/v1/clients");
                setClients(clientsResponse.data.clients);
            } catch (error) {
                console.error("Error fetching client data:", error);
            }
        };

        fetchData();

        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    const getClientType = (type: string) => {
        return type.split("-")[1]
    }

    const getStreamUrl = (tcUrl: string, name: string) => {
        return `${tcUrl}/${name}`
    }

    const secondsToHms = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        const formattedHours = String(hours).padStart(2, '0');
        const formattedMinutes = String(minutes).padStart(2, '0');
        const formattedSeconds = String(secs.toFixed(0)).padStart(2, '0');

        return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
    }

    const handleCopyToClipboard = (url: string) => {
        navigator.clipboard.writeText(url).then(() => {
            setIsClickCopy(true)

            setTimeout(() => {
                setIsClickCopy(false);
            }, 5000);
        }).catch((error) => {
            console.error('Failed to copy the URL:', error);
        });
    }

    return (
        <div className="stream-table-container">
            <h2 className="stream-table-title">Clients</h2>
            <div className="table-wrapper">
                <table className="stream-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>IP</th>
                            <th>Stream</th>
                            <th>Type</th>
                            <th>Duration</th>
                            <th>URL {isClickCopy ? "(Copied!)" : ""}</th>
                            <th>Category</th>
                        </tr>
                    </thead>
                    <tbody>
                        {clients.map((client) => (
                            <tr key={client.id}>
                                <td>{client.id}</td>
                                <td>{client.ip}</td>
                                <td>{client.stream}</td>
                                <td>{getClientType(client.type)}</td>
                                <td>{secondsToHms(client.alive)}</td>
                                <td onClick={() => handleCopyToClipboard(getStreamUrl(client.tcUrl, client.name))}>{getStreamUrl(client.tcUrl, client.name)}</td>
                                <td>{client.type}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

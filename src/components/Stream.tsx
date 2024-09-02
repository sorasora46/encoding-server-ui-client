import { useEffect, useState } from 'react';
import axios from 'axios';

interface IAudio {
    channel: number;
    codec: string;
    profile: string;
    sample_rate: number;
}

interface IStreamingBit {
    recv_30s: number;
    send_30s: number;
}

interface IPublish {
    active: boolean;
    cid: string;
}

interface IVideo {
    codec: string;
    height: number;
    level: string;
    profile: string;
    width: number;
}

interface IStream {
    app: string;
    audio: IAudio;
    clients: number;
    frames: number;
    id: string;
    kbps: IStreamingBit;
    live_ms: number;
    name: string;
    publish: IPublish;
    recv_bytes: number;
    send_bytes: number;
    tcUrl: string;
    url: string;
    vhost: string;
    video: IVideo;
}

interface IStreamResponse {
    streams: IStream[]
}

export const Stream = () => {
    const [streams, setStreams] = useState<IStream[]>([]);
    const [isClickCopy, setIsClickCopy] = useState<boolean>(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get<IStreamResponse>('http://192.168.1.6:1985/api/v1/streams');
                setStreams(response.data.streams);
            } catch (error) {
                console.error('Error fetching streams:', error);
            }
        };

        fetchData();

        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    const getAudioDetail = (audio: IAudio) => {
        if (!audio) {
            return ""
        }

        return `${audio.codec}/${audio.profile}/${audio.sample_rate}/${audio.channel === 2 ? "Stereo" : "Mono"}`
    }

    const getVideoDetail = (video: IVideo) => {
        if (!video) {
            return ""
        }

        return `${video.codec}/${video.profile}/${video.width}x${video.height}/${video.level}`
    }

    const getStreamUrl = (tcUrl: string, name: string) => {
        return `${tcUrl}/${name}`
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
            <h2 className="stream-table-title">Streams</h2>
            <div className="table-wrapper">
                <table className="stream-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>URL {isClickCopy ? "(Copied!)" : ""}</th>
                            <th>Clients</th>
                            <th>Video</th>
                            <th>Audio</th>
                        </tr>
                    </thead>
                    <tbody>
                        {streams.map((stream) => (
                            <tr key={stream.id}>
                                <td>{stream.id}</td>
                                <td>{stream.name}</td>
                                <td onClick={() => handleCopyToClipboard(getStreamUrl(stream.tcUrl, stream.name))}>{getStreamUrl(stream.tcUrl, stream.name)}</td>
                                <td>{stream.clients}</td>
                                <td>{getVideoDetail(stream?.video)}</td>
                                <td>{getAudioDetail(stream?.audio)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
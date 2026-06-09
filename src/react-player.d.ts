declare module 'react-player' {
    import { Component } from 'react';
    export interface ReactPlayerProps {
        url?: string | string[] | SourceProps[] | MediaStream;
        playing?: boolean;
        loop?: boolean;
        controls?: boolean;
        volume?: number;
        muted?: boolean;
        playbackRate?: number;
        width?: string | number;
        height?: string | number;
        style?: React.CSSProperties;
        progressInterval?: number;
        playsinline?: boolean;
        pip?: boolean;
        stopOnUnmount?: boolean;
        light?: boolean | string | PreviewProps;
        playIcon?: React.ReactElement;
        previewTabIndex?: number;
        fallback?: React.ReactElement;
        wrapper?: any;
        config?: any;
        [key: string]: any;
    }
    export interface SourceProps {
        src: string;
        type: string;
    }
    export interface PreviewProps {
        [key: string]: any;
    }
    export default class ReactPlayer extends Component<ReactPlayerProps, any> {}
}

// Map the explicit lazy-loaded submodules so TypeScript doesn't throw ts(2307)
declare module 'react-player/youtube' {
    import ReactPlayer from 'react-player';
    export default ReactPlayer;
}

declare module 'react-player/lib/players/YouTube' {
    import ReactPlayer from 'react-player';
    export default ReactPlayer;
}
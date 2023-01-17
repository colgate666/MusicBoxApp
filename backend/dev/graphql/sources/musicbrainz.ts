import { MusicBrainzApi } from "musicbrainz-api";

export class MusicSource {
    private musicApi!: MusicBrainzApi;

    constructor() {
        this.musicApi = new MusicBrainzApi({
            appName: "MusicBox",
            appVersion: "0.0.1",
            appContactInfo: "jesusmolinacz@gmail.com"
        });
    }
}
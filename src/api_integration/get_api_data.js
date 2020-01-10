const axios = require('axios').default;
const XLSX = require('xlsx');
const {DateTime} = require('luxon');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const dayMapping = (date, tz) => {
    if (date === undefined) return null;

    if (date === 'today') return DateTime.utc().startOf('day').setZone(tz);
    if (date === 'yesterday') return DateTime.utc().startOf('day').setZone(tz).minus({ days: 1 });
    if (date === 'tomorrow') return DateTime.utc().startOf('day').setZone(tz).plus({ days: 1 });

    return DateTime.fromISO(date, { zone: tz }).toFormat('dd.MM.yyyy');
};

const streams = {
    terna_apg: {
        streamId: 'streamid1', borderId: 1, borderName: 'TERNA-APG',
    },
    apg_terna: {
        streamId: 'streamid2', borderId: 2, borderName: 'APG-TERNA',
    },
    terna_eles: {
        streamId: 'streamid3', borderId: 3, borderName: 'TERNA-ELES',
    },
    eles_terna: {
        streamId: 'streamid4', borderId: 4, borderName: 'ELES-TERNA',
    },
    terna_htso: {
        streamId: 'streamid5', borderId: 7, borderName: 'TERNA-HTSO',
    },
    htso_terna: {
        streamId: 'streamid6', borderId: 8, borderName: 'HTSO-TERNA',
    },
    terna_rte: {
        streamId: 'streamid7', borderId: 9, borderName: 'TERNA-RTE',
    },
    rte_terna: {
        streamId: 'streamid8', borderId: 10, borderName: 'RTE-TERNA',
    },
    swg_terna: {
        streamId: 'streamid8', borderId: 11, borderName: 'RTE-TERNA',
    },
    terna_swg: {
        streamId: 'streamid8', borderId: 12, borderName: 'RTE-TERNA',
    },
    terna_cges: {
        streamId: 'streamid9', borderId: 31, borderName: 'TERNA-CGES',
    },
    cges_terna: {
        streamId: 'streamid10', borderId: 32, borderName: 'CGES-TERNA',
    },
};

const parseDate = (df, tf) => {
    const dateStr = df + tf;
    return DateTime.fromFormat(dateStr, 'dd.MM.yyyyH', {zone: 'UTC'}).toFormat('dd.MM.yyyy:HH:mm');
};

const magicParser = async (from, to, stream) => {
    const url = 'https://damas.terna.it/api/Ntc/NtcReportDownload';
    let r;
    try {
        r = await axios.post(url, `{"parameters":{"busDay":"${dayMapping(from,'UTC')}","busDayTill":"${dayMapping(to,'UTC')}","borderDirId":${streams[stream].borderId},"borderDirName":"${streams[stream].borderName}"}}\n`, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (e) {
        if (e.response) {
            const rError = e.response;
            console.error("Data source responded with an error code %s, message: '%s'", rError.status, JSON.stringify(rError.data));
        } else if (e.request) {
            console.error('No response received from the data source endpoint');
        } else {
            console.error('Error while composing a request to the data source');
        }
        process.exit(1);
    }
    const wb = XLSX.read(r.data.attachmentData);
    const sourceData = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames]);
    const dWithNulls = sourceData.map((x) => ({
        date: parseDate(x['Business Day'], x.Hour),
        value: parseInt(x['NTC [MW]'], 10)
    }));

    const data = dWithNulls.filter((x) => x.value !== null);
    if (data.length === 0) {
        console.log('Empty data set');
        process.exit(1);
    }
    return data;
};
module.exports = magicParser;

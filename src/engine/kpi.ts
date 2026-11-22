import type { ComputedKpis, DistrictKpi, SipasDataset } from '../types/sipas';

function sumNullable(values: (number | null)[]): number | null {
  const valid = values.filter((v): v is number => v !== null && Number.isFinite(v));
  if (valid.length === 0) return null;
  return valid.reduce((acc, n) => acc + n, 0);
}

function safePercent(part: number | null, total: number | null): number | null {
  if (part === null || total === null || !Number.isFinite(part) || !Number.isFinite(total) || total <= 0) {
    return null;
  }
  return (part / total) * 100;
}

export function computeKpis(dataset: SipasDataset): ComputedKpis {
  const { districts, balance, facilities, variables, metadata } = dataset;

  const sumDistrictPenduduk = sumNullable(districts.map((d) => d.penduduk));
  const sumDistrictHari = sumNullable(districts.map((d) => d.tonHari));
  const sumDistrictTahun = sumNullable(districts.map((d) => d.tonTahun));

  const allDistrictsComplete = districts.every(
    (d) => d.penduduk !== null && d.tonHari !== null && d.tonTahun !== null
  );

  const totalPenduduk =
    metadata.isOfficialBaseline && allDistrictsComplete && metadata.officialCityTotals.penduduk !== null
      ? metadata.officialCityTotals.penduduk
      : sumDistrictPenduduk;

  const totalTimbulanHari =
    metadata.isOfficialBaseline && allDistrictsComplete && metadata.officialCityTotals.tonHari !== null
      ? metadata.officialCityTotals.tonHari
      : sumDistrictHari;

  const totalTimbulanTahun =
    metadata.isOfficialBaseline && allDistrictsComplete && metadata.officialCityTotals.tonTahun !== null
      ? metadata.officialCityTotals.tonTahun
      : sumDistrictTahun;

  const districtKpis: DistrictKpi[] = districts.map((d) => {
    const kontribusiPersen = safePercent(d.tonTahun, totalTimbulanTahun);
    const perKapitaKgHari =
      d.tonHari !== null && d.penduduk !== null && d.penduduk > 0
        ? (d.tonHari * 1000) / d.penduduk
        : null;

    return {
      id: d.id,
      nama: d.nama,
      penduduk: d.penduduk,
      tonHari: d.tonHari,
      tonTahun: d.tonTahun,
      kontribusiPersen,
      perKapitaKgHari,
    };
  });

  const validTimbulan = districtKpis.filter((d) => d.tonHari !== null);
  const sortedTimbulanDesc = [...validTimbulan].sort(
    (a, b) => (b.tonHari ?? -Infinity) - (a.tonHari ?? -Infinity)
  );
  const tertinggiTimbulan = sortedTimbulanDesc[0] ?? null;
  const terendahTimbulan =
    sortedTimbulanDesc.length > 0 ? sortedTimbulanDesc[sortedTimbulanDesc.length - 1] : null;

  const validPerKapita = districtKpis.filter((d) => d.perKapitaKgHari !== null);
  const tertinggiPerKapita =
    [...validPerKapita].sort(
      (a, b) => (b.perKapitaKgHari ?? -Infinity) - (a.perKapitaKgHari ?? -Infinity)
    )[0] ?? null;

  const balanceTotal = balance.timbulanTahun ?? totalTimbulanTahun;
  const tingkatPenguranganPersen = safePercent(balance.penguranganTahun, balanceTotal);
  const tingkatPenangananPersen = safePercent(balance.penangananTahun, balanceTotal);
  const tingkatTerkelolaPersen = safePercent(balance.totalDikelolaTahun, balanceTotal);
  const proporsiPengolahanBahanBakuPersen = safePercent(
    balance.pengolahanBahanBakuTahun,
    balanceTotal
  );
  const proporsiPemrosesanAkhirPersen = safePercent(balance.pemrosesanAkhirTahun, balanceTotal);
  const proporsiPemrosesanAkhirDariPenangananPersen = safePercent(
    balance.pemrosesanAkhirTahun,
    balance.penangananTahun
  );

  const belumTerkelolaTahun =
    balanceTotal !== null && balance.totalDikelolaTahun !== null
      ? Math.max(0, Number((balanceTotal - balance.totalDikelolaTahun).toFixed(2)))
      : null;
  const belumTerkelolaPersen = safePercent(belumTerkelolaTahun, balanceTotal);

  const totalFasilitas = sumNullable(facilities.map((f) => f.jumlahUnit));

  const rataPerKapitaKgHari =
    totalTimbulanHari !== null && totalPenduduk !== null && totalPenduduk > 0
      ? (totalTimbulanHari * 1000) / totalPenduduk
      : null;

  const variableCounts = {
    total: variables.length,
    tersedia: variables.filter((v) => v.status === 'A').length,
    parsial: variables.filter((v) => v.status === 'P').length,
    na: variables.filter((v) => v.status === 'NA').length,
  };

  return {
    totalPenduduk,
    totalTimbulanHari,
    totalTimbulanTahun,
    sumDistrictHari,
    sumDistrictTahun,
    tingkatPenguranganPersen,
    tingkatPenangananPersen,
    tingkatTerkelolaPersen,
    proporsiPengolahanBahanBakuPersen,
    proporsiPemrosesanAkhirPersen,
    proporsiPemrosesanAkhirDariPenangananPersen,
    belumTerkelolaTahun,
    belumTerkelolaPersen,
    totalFasilitas,
    rataPerKapitaKgHari,
    districtKpis,
    tertinggiTimbulan,
    terendahTimbulan,
    tertinggiPerKapita,
    variableCounts,
  };
}

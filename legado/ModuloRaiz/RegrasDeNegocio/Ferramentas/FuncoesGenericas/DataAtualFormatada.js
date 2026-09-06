module.exports = () => {
    var data = new Date(),
    dia  = data.getDate().toString(),
    diaF = (dia.length == 1) ? '0'+dia : dia,
    mes  = (data.getMonth() + 1).toString(), // +1 porque janeiro é representado por 0
    mesF = (mes.length == 1) ? '0'+mes : mes,
    anoF = data.getFullYear();
    Hora = data.getHours().toString()
    HoraF = (Hora.length == 1) ? '0'+Hora : Hora
    Minuto = data.getMinutes().toString()
    MinutoF = (Minuto.length == 1) ? '0'+Minuto : Minuto
    return diaF+"/"+mesF+"/"+anoF+' às '+HoraF+'h'+MinutoF+'min';
}

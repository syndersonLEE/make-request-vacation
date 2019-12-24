const moment = require('moment');
const { verify } = require('../library/jwt');
const { checkVacationDate } = require('../library/calculVacation');
const documentDao = require('../dao/documentDao');
const userDao = require('../dao/userDao');


async function postVacation(userToken, documentData) {
    const userId = verify(userToken);
    if(userId < 0) {
        return -1;
    } else {
        const userData = await userDao.selectUserByIdx(userId.idx);
        const remainVacation = userData[0].userVacation;
        let applyTime;
        if(documentData.vacationTime < 1){
            applyTime = documentData.vacationTime;
        } else {
            applyTime = await checkVacationDate(documentData.vacationStartDate, documentData.vacationEndDate);
        }

        if(applyTime > remainVacation) {
            return -2;
        } else {
            let documentDto = documentData;
            documentDto['userIdx'] = userId.idx;
            documentDto['applyDate'] = moment().format('YYYY-MM-DD');
            documentDto['vacationType'] = documentData['vacationTime'];
            console.log(documentDto);
            await documentDao.insertDocument(documentDto);
            return 1;
        }
    }

}

async function getVacation(userToken) {
    const userId = verify(userToken);
    if(userId < 0) {
        return -1;
    } else {
        const userData = await userDao.selectUserByIdx(userId.idx);
        return { remainDate : userData[0].userVacation };
    }
}

module.exports = {
    postVacation,
    getVacation
}
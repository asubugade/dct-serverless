import { ClsDCT_Common } from "../../commonModule/Class.common";
import GenMember from "../../models/GenMember";
import TmplMetaData, { ITmplMetaData } from "../../models/Tmplmetadata";


let _oCommonCls = new ClsDCT_Common();


export const getMember= async(iTemplateID: any)=> {
    try {
        let oTemplate = await TmplMetaData.findOne({ iTemplateID: iTemplateID }).lean() as ITmplMetaData;
        const obj = oTemplate.aMemberCutoffs;
        const result = Object.keys(obj);

        let oMember = await GenMember.find({ cScac: { $in: result } }).lean()
        return oMember
    } catch (err) {
        _oCommonCls.log(err);
    }
}
import { Request, Response } from 'express';
import { QueryResult } from 'pg';
import * as dbUtil from './../utils/dbUtil';

interface Report {
    year: number,
    caregivers: {
        name: string,
        patients: string[]
    }[]
}

export const getReport = async (req: Request, res: Response) => {

    const sql = `
        SELECT
            caregiver.id      AS caregiver_id,
            caregiver.name    AS caregiver_name,
            patient.id        AS patient_id,
            patient.name      AS patient_name,
            visit.date        AS visit_date
        FROM caregiver
        JOIN visit ON visit.caregiver = caregiver.id
        JOIN patient ON patient.id = visit.patient
    `;
    
    let result : QueryResult;
    try {
        result = await dbUtil.sqlToDB(sql, []);
        const report: Report = {
            year: parseInt(req.params.year),
            caregivers: []
        };
        for (let row of result.rows) {
            const yearDate = new Date(row.visit_date);
           
            const index = report.caregivers.findIndex(element => {
               if (element.name == row.caregiver_name) {
                  return true;
                }
                else return false;
              });
            if(yearDate.getFullYear().toString()==req.params.year&&index==-1)            
            report.caregivers.push({
                name: row.caregiver_name,
                patients: [row.patient_name]
            });
            else if(yearDate.getFullYear().toString()==req.params.year&&index!=-1)
            report.caregivers[index].patients.push(row.patient_name);
        }
        res.status(200).json(report);
    } catch (error: any) {
        throw new Error(error.message);
    }

}

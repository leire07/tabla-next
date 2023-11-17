import React from 'react';
import { pdf } from '@react-pdf/renderer';
import {data} from "../data"
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { CreatePDF } from './renderPdf';

/**
 * The function `getPdf` takes a list of PDF IDs and an option, filters the data based on the IDs, and
 * generates PDFs based on the option selected.
 * @param {number[]} listPdfs - An array of numbers representing the IDs of the PDFs to be processed.
 * @param {number} option - The `option` parameter is a number that determines which type of PDF
 * document to create. It is used in a switch statement to determine which component to render and pass
 * to the `pdf` function. The possible values for `option` are 1 and 2.
 * @returns an object with two properties: "pdfs" and "names". The "pdfs" property is an array of
 * blobs, and the "names" property is an array of strings.
 */
async function getPdf(listPdfs: number[], option:number) {
  console.log(listPdfs)
  const pdfs = [];
  const names = [];
  for(let i = 0; i < listPdfs.length ; i++) {
  const id = listPdfs[i];
  console.log("el contenido es " + id)
  const filteredData = data.filter(item => item.key === id);
  console.log(`Processing file ${i + 1}: ${filteredData.map((item) => item.name)}`);
  const item = filteredData[0];
  // If requiresUserValidation is false, take the next file
  if (filteredData[0].requires_user_validation || filteredData[0].is_regenerating) {
    continue;
  }
  const MyDocument = () =>{
    console.log("entra en my document")
    switch(option){
    case 1:
      return pdf(
        <CreatePDF id={item.key} option={1} />
        ) 
    case 2:
      return pdf(
        <CreatePDF id={item.key} option={2} />
      )
      default:
        throw new Error(`Invalid option: ${option}`);
        };
      }
    const blob = await MyDocument().toBlob();
    pdfs.push(blob);
    names.push(filteredData[0].name);
            }
  return {pdfs, names};
}

/**
 * The function `createAndDownloadZip` takes an array of PDF files, an array of names for the PDF
 * files, and an option number as parameters, and creates and downloads a zip file containing the PDF
 * files with the specified names.
 * @param {Blob[]} pdfs - An array of Blob objects representing the PDF files to be included in the zip
 * file.
 * @param {string[]} names - An array of strings representing the names of the PDF files. Each name
 * corresponds to a PDF in the `pdfs` array.
 * @param {number} option - The `option` parameter is a number that determines the type of zip file to
 * be created. If `option` is 1, it indicates a detailed zip file, and if `option` is any other number,
 * it indicates a summary zip file.
 */
async function createAndDownloadZip(pdfs: Blob[], names: string[], option:number) {
  const zip = new JSZip();

  pdfs.forEach((pdf, index) => {
    zip.file(`${names[index]}.pdf`, pdf);
  });

  const content = await zip.generateAsync({ type: 'blob' });
  const currentDate = new Date().toLocaleDateString('es-ES');

  const optionTittle = option === 1 ? "Detailed" : "Summary"

  saveAs(content, `${currentDate}_${optionTittle}.zip`);
}


/**
 * The function `HandleZip` takes in an array of IDs and an option, retrieves PDFs based on the IDs and
 * option, and creates and downloads a zip file containing the PDFs.
 * @param {number[]} listaIds - An array of numbers representing the IDs of the items to be processed.
 * @param {number} option - The "option" parameter is a number that determines the type of operation to
 * be performed. It is used as an input for the "getPdf" and "createAndDownloadZip" functions.
 */
export const HandleZip = async (listaIds: number[], option:number) => {
  const { pdfs, names } = await getPdf(listaIds, option);

  if (pdfs.every(pdf => pdf !== null && pdf !== undefined)) {
    await createAndDownloadZip(pdfs, names, option);
  } else {
    console.error('Not all PDFs were generated');
  }
};

export default HandleZip;
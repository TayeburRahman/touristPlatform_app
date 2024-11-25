import { AboutUs, Facts, Faq, TermsConditions } from './settings.model';

//! Facts
const addFacts = async (payload: any) => {
  const checkIsExist = await Facts.findOne();
  let message;
  let result
  if (checkIsExist) {
    result=await Facts.findOneAndUpdate({}, payload, {
      new: true,
      runValidators: true,
    });
    message = 'Facts updated successfully!';
  } else {
    result= await Facts.create(payload);
    message = 'Facts added successfully!';
  }
  return
};
const getFacts = async () => {
  return await Facts.findOne();
};
//! About us
const addAboutUs = async (payload: any) => {
  const checkIsExist = await AboutUs.findOne();
  let message;
  let result
  if (checkIsExist) {
    result=await AboutUs.findOneAndUpdate({}, payload, {
      new: true,

      runValidators: true,
    });
    message= 'About us updated successfully!'  
  } else {
   result= await AboutUs.create(payload);
   message = 'About us added successfully!'
  }
  return  {result ,  message };
};
const getAboutUs = async () => {
  return await AboutUs.findOne();
};
//! Terms Conditions
const addTermsConditions = async (payload: any) => {
  const checkIsExist = await TermsConditions.findOne();
  let message;
  let result
  if (checkIsExist) {
    const result= await TermsConditions.findOneAndUpdate({}, payload, {
      new: true,

      runValidators: true,
    }) 
    message= ' Terms conditions updated successfully!' 
  } else { 
    result =  await TermsConditions.create(payload);
    message= 'Terms conditions added successfully!'
  }

  return  {result ,  message };
};
const getTermsConditions = async () => {
  return await TermsConditions.findOne();
};
//! Faqs
const addFaq = async (payload: any) => {
  console.log(payload)
  if (!payload?.questions || !payload?.answer){
    throw new Error("Question and answer are required");
  }
 
   return await Faq.create(payload); 
};
const updateFaq = async (req: any) => {
  const id =  req.params.id
 
  const payload =  req.body
  if (!payload?.questions || !payload?.answer){
    throw new Error("Question and answer are required");
  }

  const result = await Faq.findByIdAndUpdate(id, payload, { new: true });

   return result
};
const deleteFaq = async (req: any) => {
  const id = req.params.id
   return await Faq.findByIdAndDelete(id);
};
const getFaq = async () => {
  return await Faq.find();
};

export const ManageService = {
  addFacts,
  addAboutUs,
  addTermsConditions,
  getFacts,
  getAboutUs,
  getTermsConditions,
  addFaq,
  updateFaq,
  getFaq,
  deleteFaq
};

const { ObjectId } = require("mongodb");
const User = require("../models/user");
const Cv = require("../models/cv");
const Education = require("../models/cv/education");
const Experience = require("../models/cv/experience");
const Certification = require("../models/cv/certification");
const Skill = require("../models/cv/skill");
const Project = require("../models/cv/project");
const Language = require("../models/cv/language");

module.exports.addEducation = async function (req, res, next) {
      try{
        const edu = new Education ({
          establishment : req.body.establishment,
          section : req.body.section,
          diploma : req.body.diploma,
          year_start : req.body.year_start,
          year_end : req.body.year_end,
          present: req.body.present || false,
          cv : req.body.cv
        })
      const e= await edu.save()
      res.status(200).json(e);
    }
      catch(err) {
        res.status(500).json(err)
      }
};
module.exports.addExperience = async function (req, res, next) {
      try{
        const exp = new Experience({
          company : req.body.company,
          job : req.body.job,
          start : req.body.start,
          end : req.body.end,
          present: req.body.present || false,
          task_description : req.body.task_description,
          cv : req.body.cv
        })
      
      const e= await exp.save()
      res.status(200).json(e);
    }
      catch(err) {
        res.status(500).json(err)
      }
};
module.exports.addCertif = async function (req, res, next) {
  // const body = { ...req.body };
  if (req.file) {
    req.body.cert_file = req.file.filename;
  }
      try{
        const certif = new Certification ({
          domaine : req.body.domaine,
          date : req.body.date,
          credential : req.body.credential,
          cert_file : req.body.cert_file,
          cv : req.body.cv
        })
      const cert= await certif.save()
      res.status(200).json(cert);
    }
      catch(err) {
        res.status(500).json(err)
      }
};
module.exports.addSkill = async function (req, res, next) {
 
      try{
        const skill = new Skill ({
          name : req.body.name,
          level : req.body.level,
          cv : req.body.cv
        })
      const s= await skill.save()
      res.status(200).json(s);
    }
      catch(err) {
        res.status(500).json(err)
      }
};
module.exports.addLanguage = async function (req, res, next) {
 
      try{
        const language = new Language ({
          name : req.body.name,
          level : req.body.level,
          cv : req.body.cv
        })
      const l= await language.save()
      res.status(200).json(l);
    }
      catch(err) {
        res.status(500).json(err)
      }
};
module.exports.addProject = async function (req, res, next) {
  
      try{
       const project = new Project({
        title: req.body.title,
        organization : req.body.organization,
        date : req.body.date,
        description : req.body.description,
        cv : req.body.cv
       })
      const p= await project.save()
      res.status(200).json(p);
    }
      catch(err) {
        res.status(500).json(err.message)
      }
};




module.exports.getEducation = async function (req, res, next) {
  const cvID = req.params.id;
  if (!ObjectId.isValid(cvID)) {
    return res.status(404).json("ID is not valid");
  }
    try{
      const e= await Education.find({ cv:cvID })
      res.status(200).json(e);
    }catch(err) {
        res.status(500).json(err)
      }
};
module.exports.getExperience = async function (req, res, next) {
  const cvID = req.params.id;
  if (!ObjectId.isValid(cvID)) {
    return res.status(404).json("ID is not valid");
  }
      try{
      const exp= await Experience.find({ cv:cvID })
      res.status(200).json(exp);
    }
      catch(err) {
        res.status(500).json(err)
      }
};
module.exports.getCertif = async function (req, res, next) {
  const cvID = req.params.id;
  if (!ObjectId.isValid(cvID)) {
    return res.status(404).json("ID is not valid");
  }
      try{
      const cert= await Certification.find({ cv:cvID })
      res.status(200).json(cert);
    }
      catch(err) {
        res.status(500).json(err)
      }
};
module.exports.getSkill = async function (req, res, next) {
  const cvID = req.params.id;
  if (!ObjectId.isValid(cvID)) {
    return res.status(404).json("ID is not valid");
  }
      try{
      const skill= await Skill.find({ cv:cvID })
      res.status(200).json(skill);
    }
      catch(err) {
        res.status(500).json(err)
      }
};
module.exports.getLanguage = async function (req, res, next) {
  const cvID = req.params.id;
  if (!ObjectId.isValid(cvID)) {
    return res.status(404).json("ID is not valid");
  }
      try{
      const language= await Language.find({ cv:cvID })
      res.status(200).json(language);
    }
      catch(err) {
        res.status(500).json(err)
      }
};
module.exports.getProject = async function (req, res, next) {
  const cvID = req.params.id;
  if (!ObjectId.isValid(cvID)) {
    return res.status(404).json("ID is not valid");
  }
      try{
      const project= await Project.find({cv : cvID})
      res.status(200).json(project);
    }
      catch(err) {
        res.status(500).json(err)
      }
};
module.exports.getUserCV = async function (req, res, next) {
  const userID = req.params.id;
  if (!ObjectId.isValid(userID)) {
    return res.status(404).json("ID is not valid");
  }
      try{
      const cv= await Cv.find({user : userID})
      res.status(200).json(cv);
    }
      catch(err) {
        res.status(500).json(err)
      }
};
module.exports.getSummary = async function (req, res, next) {
  const userID = req.params.id;
  if (!ObjectId.isValid(userID)) {
    return res.status(404).json("ID is not valid");
  }
      try{
      const cv= await Cv.findOne({user : userID})
      .select('summary -_id')
      res.status(200).json(cv);
    }
      catch(err) {
        res.status(500).json(err)
      }
};



module.exports.updateEducation = async function (req, res, next) {
  const ID = req.params.id;
  if (!ObjectId.isValid(ID)) {
    return res.status(404).json("ID is not valid");
  }
      try{
      const e= await Education.findByIdAndUpdate(ID, 
       {
        establishment:req.body.establishment,
        section:req.body.section,
        diploma:req.body.diploma,
        year_start:req.body.year_start,
        year_end:req.body.year_end,
        present: req.body.present || false,
        cv: req.body.cv
       }).populate('cv')
        res.status(200).json(e);
    }
      catch(err) {
        res.status(500).json(err)
      }
};
module.exports.updateExperience = async function (req, res, next) {
  const ID = req.params.id;
  if (!ObjectId.isValid(ID)) {
    return res.status(404).json("ID is not valid");
  }
      try{
      const exp= await Experience.findByIdAndUpdate(ID, 
        { 
          company:req.body.company,
          job:req.body.job,
          start:req.body.start,
          end:req.body.end,
          present:req.body.present || false,
          task_description:req.body.task_description,
          cv:req.body.cv

        }).populate('cv')
      res.status(200).json(exp);
    }
      catch(err) {
        res.status(500).json(err)
      }
};
module.exports.updateCertif = async function (req, res, next) {
  const ID = req.params.id;
  if (!ObjectId.isValid(ID)) {
    return res.status(404).json("ID is not valid");
  }
      try{
        if (req.file) {
          req.body.cert_file = req.file.filename;
        }
      const cert= await Certification.findByIdAndUpdate(ID, 
        {
          domaine : req.body.domaine,
          date : req.body.date,
          credential : req.body.credential,
          cert_file: req.body.cert_file,
          cv : req.body.cv
       }).populate('cv')
      res.status(200).json(cert);
    }
      catch(err) {
        res.status(500).json(err)
      }
};
module.exports.updateSkill = async function (req, res, next) {
  const ID = req.params.id;
  if (!ObjectId.isValid(ID)) {
    return res.status(404).json("ID is not valid");
  }
      try{
      const skill= await Skill.findByIdAndUpdate(ID, 
        {
          name:req.body.name,
          level:req.body.level,
          cv:req.body.cv
        }).populate('cv')
      res.status(200).json(skill);
    }
      catch(err) {
        res.status(500).json(err)
      }
};
module.exports.updateLanguage = async function (req, res, next) {
  const ID = req.params.id;
  if (!ObjectId.isValid(ID)) {
    return res.status(404).json("ID is not valid");
  }
      try{
      const language= await Language.findByIdAndUpdate(ID, 
        {
          name:req.body.name,
          level:req.body.level,
          cv:req.body.cv
        }).populate('cv')
      res.status(200).json(language);
    }
      catch(err) {
        res.status(500).json(err)
      }
};
module.exports.updateSummary = async function (req, res, next) {
  const ID = req.params.id;
  if (!ObjectId.isValid(ID)) {
    return res.status(404).json("ID is not valid");
  }
      try{
      const cv= await Cv.findByIdAndUpdate(ID, 
        {
          summary:req.body.summary,
          user:req.body.user
        })
      res.status(200).json(cv);
    }
      catch(err) {
        res.status(500).json(err)
      }
};
module.exports.updateProject = async function (req, res, next) {
  const ID = req.params.id;
  if (!ObjectId.isValid(ID)) {
    return res.status(404).json("ID is not valid");
  }
      try{
      const project= await Project.findByIdAndUpdate(ID, 
        {
          organization:req.body.organization,
          title:req.body.title,
          date:req.body.date,
          description:req.body.description,
          cv:req.body.cv
        }).populate('cv')
      res.status(200).json(project);
    }
      catch(err) {
        res.status(500).json(err)
      }
};




module.exports.deleteEducation = async function (req, res) {
  const ID = req.params.id;

  if (!ObjectId.isValid(ID)) {
    return res.status(404).json("ID is not valid");
  }
  try{
    const edu= await Education.findByIdAndDelete({
      _id:ID 
    })
    return  res.status(200).json(edu);
    }
    catch(err) {
      res.status(500).json(err)
    };
};
module.exports.deleteExperience = async function (req, res) {
  const ID = req.params.id;

  if (!ObjectId.isValid(ID)) {
    return res.status(404).json("ID is not valid");
  }
  try{
    const exp= await Experience.findByIdAndDelete({_id:ID})
    return  res.status(200).json(exp);
    }
    catch(err) {
      res.status(500).json(err)
    };
};
module.exports.deleteCertif = async function (req, res) {
  const ID = req.params.id;

  if (!ObjectId.isValid(ID)) {
    return res.status(404).json("ID is not valid");
  }
  try{
    const cert= await Certification.findByIdAndDelete({_id:ID})
    return  res.status(200).json(cert);
    }
    catch(err) {
      res.status(500).json(err)
    };
};
module.exports.deleteLanguage = async function (req, res) {
  const ID = req.params.id;

  if (!ObjectId.isValid(ID)) {
    return res.status(404).json("ID is not valid");
  }
  try{
    const language= await Language.findByIdAndDelete({_id:ID}).populate('cv')
    return  res.status(200).json(language);
    }
    catch(err) {
      res.status(500).json(err)
    };
};
module.exports.deleteSkill = async function (req, res) {
  const ID = req.params.id;

  if (!ObjectId.isValid(ID)) {
    return res.status(404).json("ID is not valid");
  }
  try{
    const skill= await Skill.findByIdAndDelete({_id:ID}).populate('cv')
    return  res.status(200).json(skill);
    }
    catch(err) {
      res.status(500).json(err)
    };
};
module.exports.deleteProject = async function (req, res) {
  const ID = req.params.id;

  if (!ObjectId.isValid(ID)) {
    return res.status(404).json("ID is not valid");
  }
  try{
    const p= await Project.findByIdAndDelete({_id:ID}).populate('cv')
    return  res.status(200).json(p);
    }
    catch(err) {
      res.status(500).json(err)
    };
};





module.exports.filterCvs = async function (req, res) {
  var skillsFilter = req.body.skills;
 
  if (skillsFilter) {
    skillsFilter = skillsFilter.trim().length === 0 ? null : skillsFilter;
  }
  try {
    if (skillsFilter) {
      const cvs = await Cvs.skills.find({
        roles: { $ne: "admin" },
        isEnabled: isNotEnabledFilter ? false : true,
        _id: { $ne: res.locals.user._id },
      skillsFilter : req.body.skills,
      })
      .select(skillsFilter);

     if (cvs) {
        res.status(200).json(cvs);
      }
    } 
  } catch (error) {
    res.status(500).json(error);
  }
};
module.exports.searchCvs = async function (req, res) {
  var skillsFilter = req.body.skills;

  if (skillsFilter) {
    skillsFilter = skillsFilter.trim().length === 0 ? null : skillsFilter;
  }
  try {
    const cvs = await Cvs.skills.find({
      roles: { $ne: "admin" },
      isEnabled: isNotEnabledFilter ? false : true,
      _id: { $ne: res.locals.user._id },
     
      skills: skillsFilter
        ? new RegExp(skillsFilter, "i")
        : new RegExp("[a-zA-Z]"),
    })
      .select(skillsFilter);
    if (cvs) {
      res.status(200).json(cvs);
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

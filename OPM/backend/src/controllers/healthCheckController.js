const HealthCheck = require('../models/healthCheckModel');
const Contract = require('../models/contractModel');

exports.createHealhCheck = async (req, res) => {
  try {
    const _id = req.body.contractId
    const healthCheck = HealthCheck(req.body.data);
    await healthCheck.save();
    const healthCheckId = healthCheck._id.toString();
    const updateContract = await Contract.findByIdAndUpdate(
      { _id },
      { $push: { healthChecklist: healthCheckId } },
      { new: true }
    )
      .populate({
        path: "healthChecklist",
      });
    res.status(200).json({ err: false, message: "Successful operation !", rows: updateContract });

  } catch (error) {
    res.status(500).json({ err: true, message: error.message });
  }
};

exports.updateHealthCheck = async (req, res) => {
  try {
    const { _id, designation, SN, model, affectation, emplacement, adresseIP, ressources, observation } = req.body;
    const updatedHealthChek = await HealthCheck.findByIdAndUpdate(
      { _id },
      { designation, SN, model, affectation, emplacement, adresseIP, ressources, observation },
      { new: true }
    );
    if (!updatedHealthChek) {
      return res.status(404).json({ err: true, message: "No (data,operation) (found,done) ! " });
    }
    res.status(200).json({ err: false, message: "Successful operation !", rows: updatedHealthChek });
  } catch (error) {
    res.status(500).json({ err: true, message: error.message });
  }
};

exports.deleteHealthCheck = async (req, res) => {
  try {
    const healthCheck = await HealthCheck.findByIdAndDelete(req.body._id);
    if (!healthCheck) {
      return res.status(404).json({ err: true, message: "No (data,operation) (found,done) ! " });
    }

    const ContractId = req.body.contractId;
    await Contract.findOneAndUpdate(
      { _id: ContractId },
      { $pull: { healthChecklist: req.body._id } },
      { new: true }
    );
    res.status(200).json({ err: false, message: "Successful operation !", rows: healthCheck });
  } catch (error) {
    res.status(500).json({ err: true, message: error.message });
  }
};

exports.getHealthCheckByContract = async (req, res) => {
  try {
    const healthChecklist = await Contract.findById(req.params._id)
      .populate({
        path: 'healthChecklist',
      })

    res.status(200).json({ err: false, message: "Successful operation!", rows: healthChecklist });
  } catch (error) {
    res.status(500).json({ err: true, message: error.message });
  }
};


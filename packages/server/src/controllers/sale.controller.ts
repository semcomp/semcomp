import saleService from "../services/sale.service";

import { handleValidationResult } from "../lib/handle-validation-result";
import { handleError } from "../lib/handle-error";

const SaleController = {
  getSales: async (req, res, next) => {
    try {
      const result = await saleService.getSales();

      return res.status(200).json(result);
    } catch (error) {
      return handleError(error, next);
    }
  },

  getItems: async (req, res, next) => {
    try {
      const result = await saleService.getItems();

      return res.status(200).json(result);
    } catch (error) {
      return handleError(error, next);
    }
  },

  getAvailables: async (req, res, next) => {
    try {
      const result = await saleService.getAvailables();
      return res.status(200).json(result);
    } catch (error) {
      return handleError(error, next);
    }
  },
  
  getOne: async (req, res, next) => {
    try {
      handleValidationResult(req);

      const { id } = req.params;
      const sale = await saleService.findOne({id: id});

      return res.status(200).json(sale);
    } catch (error) {
      return handleError(error, next);
    }
  },
};

export default SaleController;

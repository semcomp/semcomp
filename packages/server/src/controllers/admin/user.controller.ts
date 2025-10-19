import AdminLog from "../../models/admin-log";
import HttpError from "../../lib/http-error";
import eventService from "../../services/event.service";
import attendanceService from "../../services/attendance.service";
import userService from "../../services/user.service";
import houseService from "../../services/house.service";
import User from "../../models/user";
import houseMemberService from "../../services/house-member.service";
import achievementService from "../../services/achievement.service";
import AchievementTypes from "../../lib/constants/achievement-types-enum";
import userAchievementService from "../../services/user-achievement.service";
import UserAchievement from "../../models/user-achievement";
import { handleError } from "../../lib/handle-error";
import adminLogService from "../../services/admin-log.service";
import userDisabilityService from "../../services/user-disability.service";
import Disability from "../../lib/constants/disability-enum";
import PaymentServiceImpl from "../../services/payment-impl.service";
import TShirtSize from "../../lib/constants/t-shirt-size-enum";
import PaymentStatus from "../../lib/constants/payment-status-enum";
import { PaginationRequest, PaginationResponse } from "../../lib/pagination";
import FoodOption from "../../lib/constants/food-option-enum";
import saleService from "../../services/sale.service";

export default class UserController {
  private paymentService: PaymentServiceImpl;

  constructor(paymentService: PaymentServiceImpl) {
    this.paymentService = paymentService;
  }

  public async list(req, res, next) {
    const pagination = new PaginationRequest(
      +req.query.page,
      +req.query.items,
    );

    const usersFound = await userService.find({ pagination });
    const housesFound = await houseService.find({
      pagination: new PaginationRequest(1, 9999),
    });
    const houseMembersFound = await houseMemberService.find();
    const userDisabilities = await userDisabilityService.find();
    const payments = await this.paymentService.find();
    const sales = await saleService.getSales();

    type ListUser = (User & {
      house: {
        name: string,
      },
      payment: {
        status: PaymentStatus[],
        tShirtSize: TShirtSize,
        foodOption: FoodOption,
        saleOption: string[][],
      },
      disabilities: Disability[]
    })

    const users: ListUser[] = [];
    for (const user of usersFound.getEntities()) {
      let userHouse = "Não possui";
      const userHouseMember = houseMembersFound.find((houseMember) => {
        return houseMember.userId === user.id;
      });

      if (userHouseMember) {
        userHouse = housesFound.getEntities().find((house) => {
          return house.id === userHouseMember.houseId;
        }).name;
      }

      let userPayments = payments.filter((payment) => {
        return payment.userId === user.id && payment.status !== PaymentStatus.CANCELED;
      });

      const userPaymentStatus = [];
      const userPaymentSaleOption = [];
      let userPaymentTShirtSize = null;
      let userPaymentFoodOption = null;

      userPayments.forEach((payment) => {
        userPaymentStatus.push(payment.status);
        userPaymentSaleOption.push(payment.salesOption);

        if (payment.tShirtSize !== TShirtSize.NONE) {
          userPaymentTShirtSize = payment.tShirtSize;
        }
        if (payment.foodOption !== FoodOption.NONE) {
          userPaymentFoodOption = payment.foodOption;
        }
      });

      users.push({
        ...user,
        house: {
          name: userHouse,
        },
        payment: {
          status: userPayments ? userPaymentStatus : null,
          tShirtSize: userPaymentTShirtSize,
          foodOption: userPaymentFoodOption,
          saleOption: userPayments ? userPaymentSaleOption : null,
        },
        disabilities: userDisabilities
          .filter((userDisability) => userDisability.userId === user.id)
          .map((userDisability) => userDisability.disability),
      });
    }

    return res.status(200).json(
      new PaginationResponse<ListUser>(users, usersFound.getTotalNumberOfItems())
    );
  }


  public async listFilteredUsers(req, res, next) {
    const usersFound = await userService.filteredFindBackoffice({
      filters: req.query.filter,
      pagination: new PaginationRequest(
        +req.query.page,
        +req.query.items,
      ),
    });

    return res.status(200).json(usersFound);
}

  public async listForEnterprise(req, res, next) {
    const pagination = new PaginationRequest(
      +req.query.page,
      +req.query.items,
    );
    const usersFound = await userService.find({
      filters: { permission: true },
      pagination,
    });

    return res.status(200).json(usersFound);
  }

  public async get(req, res, next) {
    try {
      const { id } = req.params;

      const userFound = await userService.findById(id);
      if (!userFound) {
        throw new HttpError(404, ["Usuário não encontrado."]);
      }

      return res.status(200).json(userFound);
    } catch (error) {
      return handleError(error, next);
    }
  }

  public async addUserAchievement(req, res, next) {
    try {
      const { userId, achievementId } = req.params;

      const user = await userService.findById(userId);
      if (!user) {
        throw new HttpError(404, ["Usuário não encontrado."]);
      }
      const achievement = await achievementService.findOne({
        id: achievementId,
        type: AchievementTypes.INDIVIDUAL,
      });
      if (!achievement) {
        throw new HttpError(404, ["Conquista não encontrado."]);
      }

      let userAchievement: UserAchievement = await userAchievementService.findOne({
        userId: user.id,
        achievementId: achievement.id,
      });
      if (userAchievement) {
        throw new HttpError(400, [`Conquista já completa por ${user.name}.`]);
      }

      userAchievement = {
        userId: user.id,
        achievementId: achievement.id,
      };
      await userAchievementService.create(userAchievement);

      return res.status(200).send(user);
    } catch (error) {
      return handleError(error, next);
    }
  }

  public async update(req, res, next) {
    try {
      const { id } = req.params;

      const user = await userService.findById(id);

      for (const key of Object.keys(req.body)) {
        if (req.body[key] !== undefined) {
          user[key] = req.body[key];
        }
      }

      const updatedUser = await userService.update(user);

      const adminLog: AdminLog = {
        adminId: req.adminUser.id,
        type: "update",
        collectionName: "user",
        objectAfter: JSON.stringify(updatedUser),
      };
      await adminLogService.create(adminLog);

      return res.status(200).send(updatedUser);
    } catch (error) {
      return handleError(error, next);
    }
  }

  public async deleteById(req, res, next) {
    try {
      const { id } = req.params;

      const userFound = await userService.findById(id);
      if (!userFound) {
        throw new HttpError(404, ["Usuário não encontrado."]);
      }

      await userService.delete(userFound);

      const adminLog: AdminLog = {
        adminId: req.adminUser.id,
        type: "delete",
        collectionName: "user",
        objectBefore: JSON.stringify(userFound),
      };
      await adminLogService.create(adminLog);

      return res.status(200).send(userFound);
    } catch (error) {
      return handleError(error, next);
    }
  }
}

"use client";

import { api } from "@/lib/api";
import { getThemeAwareToast } from "./toast";

// Helper function to extract error message from API error
const getErrorMessage = (error: any): string => {
  if (error?.details?.message) return error.details.message;
  if (error?.details?.error) return error.details.error;
  if (error?.message) return error.message;
  return "An unexpected error occurred";
};

// Wrapper function for API calls with automatic toast notifications
export const withToast = {
  // Auth methods
  signup: async (input: Parameters<typeof api.signup>[0]) => {
    const toast = getThemeAwareToast();
    try {
      const result = await api.signup(input);
      toast.success("Account created successfully!", {
        description: "Welcome to Philand! You can now start managing your budgets."
      });
      return result;
    } catch (error) {
      toast.error("Failed to create account", {
        description: getErrorMessage(error)
      });
      throw error;
    }
  },

  login: async (input: Parameters<typeof api.login>[0]) => {
    const toast = getThemeAwareToast();
    try {
      const result = await api.login(input);
      toast.success("Welcome back!", {
        description: "You have successfully signed in."
      });
      return result;
    } catch (error) {
      toast.error("Failed to sign in", {
        description: getErrorMessage(error)
      });
      throw error;
    }
  },

  forgotEmail: async (input: Parameters<typeof api.forgotEmail>[0]) => {
    const toast = getThemeAwareToast();
    try {
      const result = await api.forgotEmail(input);
      toast.success("Reset code sent!", {
        description: "Check your email for the password reset code."
      });
      return result;
    } catch (error) {
      toast.error("Failed to send reset code", {
        description: getErrorMessage(error)
      });
      throw error;
    }
  },

  resetPassword: async (input: Parameters<typeof api.resetPassword>[0]) => {
    const toast = getThemeAwareToast();
    try {
      const result = await api.resetPassword(input);
      toast.success("Password reset successfully!", {
        description: "You can now sign in with your new password."
      });
      return result;
    } catch (error) {
      toast.error("Failed to reset password", {
        description: getErrorMessage(error)
      });
      throw error;
    }
  },

  // Profile methods
  profile: {
    update: async (input: Parameters<typeof api.profile.update>[0]) => {
      const toast = getThemeAwareToast();
      try {
        const result = await api.profile.update(input);
        toast.success("Profile updated!", {
          description: "Your profile information has been saved."
        });
        return result;
      } catch (error) {
        toast.error("Failed to update profile", {
          description: getErrorMessage(error)
        });
        throw error;
      }
    },

    uploadAvatar: async (input: Parameters<typeof api.profile.uploadAvatar>[0]) => {
      const toast = getThemeAwareToast();
      try {
        const result = await api.profile.uploadAvatar(input);
        toast.success("Avatar updated!", {
          description: "Your profile picture has been changed."
        });
        return result;
      } catch (error) {
        toast.error("Failed to upload avatar", {
          description: getErrorMessage(error)
        });
        throw error;
      }
    },

    deleteAvatar: async () => {
      const toast = getThemeAwareToast();
      try {
        const result = await api.profile.deleteAvatar();
        toast.success("Avatar removed!", {
          description: "Your profile picture has been removed."
        });
        return result;
      } catch (error) {
        toast.error("Failed to remove avatar", {
          description: getErrorMessage(error)
        });
        throw error;
      }
    }
  },

  // Budget methods
  budgets: {
    create: async (input: Parameters<typeof api.budgets.create>[0]) => {
      const toast = getThemeAwareToast();
      try {
        const result = await api.budgets.create(input);
        toast.success("Budget created!", {
          description: `"${input.name}" is ready for your financial tracking.`
        });
        return result;
      } catch (error) {
        toast.error("Failed to create budget", {
          description: getErrorMessage(error)
        });
        throw error;
      }
    },

    update: async (id: string, input: Parameters<typeof api.budgets.update>[1]) => {
      const toast = getThemeAwareToast();
      try {
        const result = await api.budgets.update(id, input);
        toast.success("Budget updated!", {
          description: "Your budget settings have been saved."
        });
        return result;
      } catch (error) {
        toast.error("Failed to update budget", {
          description: getErrorMessage(error)
        });
        throw error;
      }
    },

    delete: async (id: string) => {
      const toast = getThemeAwareToast();
      try {
        const result = await api.budgets.delete(id);
        toast.success("Budget deleted!", {
          description: "The budget and all its data have been removed."
        });
        return result;
      } catch (error) {
        toast.error("Failed to delete budget", {
          description: getErrorMessage(error)
        });
        throw error;
      }
    }
  },

  // Category methods
  categories: {
    create: async (budgetId: string, input: Parameters<typeof api.categories.create>[1]) => {
      const toast = getThemeAwareToast();
      try {
        const result = await api.categories.create(budgetId, input);
        toast.success("Category created!", {
          description: `"${input.name}" category is ready to use.`
        });
        return result;
      } catch (error) {
        toast.error("Failed to create category", {
          description: getErrorMessage(error)
        });
        throw error;
      }
    },

    update: async (budgetId: string, categoryId: string, input: Parameters<typeof api.categories.update>[2]) => {
      const toast = getThemeAwareToast();
      try {
        const result = await api.categories.update(budgetId, categoryId, input);
        toast.success("Category updated!", {
          description: "Your category changes have been saved."
        });
        return result;
      } catch (error) {
        toast.error("Failed to update category", {
          description: getErrorMessage(error)
        });
        throw error;
      }
    },

    delete: async (budgetId: string, categoryId: string) => {
      const toast = getThemeAwareToast();
      try {
        const result = await api.categories.delete(budgetId, categoryId);
        toast.success("Category deleted!", {
          description: "The category has been removed from your budget."
        });
        return result;
      } catch (error) {
        toast.error("Failed to delete category", {
          description: getErrorMessage(error)
        });
        throw error;
      }
    }
  },

  // Entry methods
  entries: {
    create: async (budgetId: string, input: Parameters<typeof api.entries.create>[1]) => {
      const toast = getThemeAwareToast();
      try {
        const result = await api.entries.create(budgetId, input);
        toast.success("Entry added!", {
          description: `${input.kind === 'income' ? 'Income' : 'Expense'} of ${input.amount} has been recorded.`
        });
        return result;
      } catch (error) {
        toast.error("Failed to add entry", {
          description: getErrorMessage(error)
        });
        throw error;
      }
    },

    update: async (budgetId: string, entryId: string, input: Parameters<typeof api.entries.update>[2]) => {
      const toast = getThemeAwareToast();
      try {
        const result = await api.entries.update(budgetId, entryId, input);
        toast.success("Entry updated!", {
          description: "Your changes have been saved."
        });
        return result;
      } catch (error) {
        toast.error("Failed to update entry", {
          description: getErrorMessage(error)
        });
        throw error;
      }
    },

    delete: async (budgetId: string, entryId: string) => {
      const toast = getThemeAwareToast();
      try {
        const result = await api.entries.delete(budgetId, entryId);
        toast.success("Entry deleted!", {
          description: "The entry has been removed from your budget."
        });
        return result;
      } catch (error) {
        toast.error("Failed to delete entry", {
          description: getErrorMessage(error)
        });
        throw error;
      }
    }
  },

  // Member methods
  members: {
    create: async (budgetId: string, input: Parameters<typeof api.members.create>[1]) => {
      const toast = getThemeAwareToast();
      try {
        const result = await api.members.create(budgetId, input);
        toast.success("Member invited!", {
          description: `${input.email} has been added to the budget.`
        });
        return result;
      } catch (error) {
        toast.error("Failed to invite member", {
          description: getErrorMessage(error)
        });
        throw error;
      }
    },

    update: async (budgetId: string, memberId: string, input: Parameters<typeof api.members.update>[2]) => {
      const toast = getThemeAwareToast();
      try {
        const result = await api.members.update(budgetId, memberId, input);
        toast.success("Member role updated!", {
          description: `Role has been changed to ${input.role}.`
        });
        return result;
      } catch (error) {
        toast.error("Failed to update member role", {
          description: getErrorMessage(error)
        });
        throw error;
      }
    },

    remove: async (budgetId: string, memberId: string) => {
      const toast = getThemeAwareToast();
      try {
        const result = await api.members.remove(budgetId, memberId);
        toast.success("Member removed!", {
          description: "The member has been removed from the budget."
        });
        return result;
      } catch (error) {
        toast.error("Failed to remove member", {
          description: getErrorMessage(error)
        });
        throw error;
      }
    }
  }
};

// Export the original api for read operations (no toast needed)
export { api };
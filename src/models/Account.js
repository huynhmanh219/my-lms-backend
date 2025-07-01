const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const Account = sequelize.define('Account', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    role_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'roles',
            key: 'id'
        }
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    last_login: {
        type: DataTypes.DATE,
        allowNull: true
    },
    first_login: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        comment: 'True if user has not changed password after first login'
    },
    email_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    email_verification_token: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    password_reset_token: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    password_reset_expires: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'accounts',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            unique: true,
            fields: ['email']
        },
        {
            fields: ['role_id']
        }
    ],
    hooks: {
        beforeCreate: async (account) => {
            if (account.password) {
                account.password = await bcrypt.hash(account.password, 12);
            }
        },
        beforeUpdate: async (account) => {
            if (account.changed('password')) {
                account.password = await bcrypt.hash(account.password, 12);
            }
        }
    }
});


Account.prototype.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

Account.prototype.updateLastLogin = async function() {
    this.last_login = new Date();
    return await this.save();
};

module.exports = Account;
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const base_url = 'http://localhost:7777';
const createProfiles = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const responseCollection = [];
    const url = `${base_url}/profile`;
    for (const eachProfileData of data) {
        const response = yield axios_1.default.post(url, eachProfileData);
        responseCollection.push(response.data);
    }
    return responseCollection;
});
const createGroups = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const responseCollection = [];
    const url = `${base_url}/group`;
    for (const eachGroup of data) {
        const response = yield axios_1.default.post(url, eachGroup);
        responseCollection.push(response.data);
    }
    return responseCollection;
});
const addGroupMembers = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const responseCollection = [];
    const url = `${base_url}/group/add-member`;
    for (const eachMember of data) {
        const response = yield axios_1.default.post(url, eachMember);
        responseCollection.push(response.data);
    }
    return responseCollection;
});
const deleteGroupMember = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const url = `${base_url}/group/delete-member`;
    return (yield axios_1.default.post(url, data)).data;
});
const createChat = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const url = `${base_url}/chat`;
    return (yield axios_1.default.post(url, data)).data;
});
const characters = [
    { firstName: "Walter", lastName: "White", phoneNumber: "(505) 503-4455" },
    { firstName: "Jesse", lastName: "Pinkman", phoneNumber: "(505) 504-4455" },
    { firstName: "Saul", lastName: "Goodman", phoneNumber: "(505) 505-4455" },
    { firstName: "Hank", lastName: "Schrader", phoneNumber: "(505) 506-4455" },
    { firstName: "Skyler", lastName: "White", phoneNumber: "(505) 507-4455" },
    { firstName: "Gustavo", lastName: "Fring", phoneNumber: "(505) 508-4455" },
    { firstName: "Mike", lastName: "Ehrmantraut", phoneNumber: "(505) 509-4455" },
    { firstName: "Kim", lastName: "Wexler", phoneNumber: "(505) 510-4455" },
    { firstName: "Howard", lastName: "Hamlin", phoneNumber: "(505) 511-4455" },
    { firstName: "Chuck", lastName: "McGill", phoneNumber: "(505) 512-4455" }
];
//createProfiles(characters).then(
//    responses => { console.log( responses); }
//)
const groups = [
    {
        details: {
            name: "Meth Lab", description: "welcome to the meth laboratory", accessibility: "private"
        },
        members: [
            { connectionId: "65f1e3e7c2c1f50d5354b1ab", status: "owner" },
            { connectionId: "65f1e3e7c2c1f50d5354b1ae" },
            { connectionId: "65f1e3e7c2c1f50d5354b1b1" },
        ]
    },
    {
        details: {
            name: "C++ community", description: "the oldest community of C++", accessibility: "public"
        },
        members: [
            { connectionId: '65f1e3e7c2c1f50d5354b1c3', status: 'owner' }
        ]
    }
];
//createGroups(groups).then(
//    responses => {console.log(responses)}
//)
//createChat({
//    category: "group",
//    connectionId: "65f1e5a4c2c1f50d5354b1c8"
//}).then(response => console.log(response));
//
//createChat({
//    category: "group",
//    connectionId: "65f1e5a4c2c1f50d5354b1cd"
//}).then(response => console.log(response));

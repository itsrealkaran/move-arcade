/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "@/(.*)": "<rootDir>/src/$1",
    "@components/(.*)": "<rootDir>/src/components/$1",
    "@assets/(.*)": "<rootDir>/src/assets/$1",
    "@store/(.*)": "<rootDir>/src/store/$1",
    "@gameconfig/(.*)": "<rootDir>/src/game-config/$1",
  },
  transform: {
    "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$":
      "<rootDir>/src/test-utils/fileMock.js",
  },
  setupFilesAfterEnv: ["<rootDir>/src/test-utils/setupTests.ts"],
};

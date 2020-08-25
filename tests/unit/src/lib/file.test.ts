import { File } from '../../../../src/lib/file';
import { resolve, normalize } from 'path';
import { ensureDirSync, emptyDirSync } from 'fs-extra';
import { cwd } from 'process';

const stubsDir: string = resolve(`${cwd()}/tests`, 'stubs');

describe('File', () => {
  beforeAll(() => {
    ensureDirSync(stubsDir);
  });

  afterEach(() => {
    emptyDirSync(stubsDir);
  });

  describe('Relative to validations', () => {
    test('it returns if a file does not exists', () => {
      const file: string = resolve(stubsDir, 'file.js');
      expect(File.exists(file)).toBeFalsy();
    });

    test('it returns if a file exists', () => {
      const file: string = resolve(stubsDir, 'file.js');
      new File(file).write('foobar');

      expect(File.exists(file)).toBeTruthy();
    });

    test('it returns if the current file path is a directory', () => {
      const result = new File(resolve(stubsDir)).isDirectory();
      expect(result).toBeTruthy();
    });

    test('it returns if the current file path is not a directory', () => {
      const result = new File('path/to/file.js').isDirectory();
      expect(result).toBeFalsy();
    });

    test('it returns if a the curren file path is a file', () => {
      const file: string = resolve(stubsDir, 'file.js');
      new File(file).write('foobar');

      const result: boolean = new File(file).isFile();
      expect(result).toBeTruthy();
    });

    test('it returns if a the curren file path is not a file', () => {
      expect(new File('path/to').isFile()).toBeFalsy();
    });
  });

  describe('Relative to path', () => {
    test('it returns the absolute path of the file', () => {
      const file: string = resolve(stubsDir, 'file.js');
      expect(file).toBe(new File(file).path());
    });

    test('it returns the relative path to the file', () => {
      const filePath: string = 'path/to/file.js';
      const newFilePath: string = '../path/to/file.js';

      const file: File = new File(filePath);
      const newFile: File = new File(newFilePath);

      expect(normalize(filePath)).toBe(file.relativePath());
      expect(normalize(newFilePath)).toBe(newFile.relativePath());
    });

    test('it knows the base directory path for the file', () => {
      const file: File = new File('path/to/file.js');

      const result = file.base();

      expect(result).toBe(resolve('path/to'));
    });
  });

  describe('Relative to filename', () => {
    test('it returns file name', () => {
      const file: File = new File('path/to/file.js');

      const result: string = file.name() || '';

      const expected: string = 'file.js';
      expect(result).toBe(expected);
    });

    test('it returns the file name without the extension', () => {
      const file: File = new File('path/to/file.js');

      const result: string = file.nameWithoutExtension() || '';

      const expected: string = 'file';
      expect(result).toBe(expected);
    });

    test('it returns the extension of the file', () => {
      const file: File = new File('path/to/file.js');

      const result: string = file.extension() || '';

      const expected: string = '.js';
      expect(result).toBe(expected);
    });
  });

  test('it has a static constructor', () => {
    const file: File = File.find('path/to/file.js');
    const result = file instanceof File;

    expect(result).toBeTruthy();
  });
});

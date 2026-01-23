import mongoose from 'mongoose';
import Project from '../models/Project.js';
import Teacher from '../models/Teacher.js';
import dotenv from 'dotenv';

dotenv.config();

async function migrate() {
  try {
    console.log('🚀 開始專案遷移...');
    await mongoose.connect(process.env.MONGO_URI!);

    // 1. 檢查是否已有專案
    const existingProjects = await Project.find({});
    if (existingProjects.length > 0) {
      console.log('⚠️  專案已存在，跳過建立：');
      existingProjects.forEach(p => console.log(`   - ${p.name} (${p.code})`));
    } else {
      // 2. 建立 TFETP 專案
      const tfetpProject = await Project.create({
        name: 'TFETP 專案',
        code: 'TFETP',
        description: 'Foreign English Teachers Program',
        isActive: true
      });
      console.log(`✓ 建立專案: ${tfetpProject.name} (${tfetpProject.code})`);

      // 3. 建立獨立委任專案
      const independentProject = await Project.create({
        name: '獨立委任專案',
        code: 'INDEPENDENT',
        description: 'Independent Contract Teachers',
        isActive: true
      });
      console.log(`✓ 建立專案: ${independentProject.name} (${independentProject.code})`);
    }

    // 4. 將所有現有教師指派到 TFETP 專案
    const tfetpProject = await Project.findOne({ code: 'TFETP' });
    if (!tfetpProject) {
      throw new Error('TFETP 專案不存在');
    }

    const teachersWithoutProject = await Teacher.countDocuments({
      $or: [
        { project: { $exists: false } },
        { project: null }
      ]
    });

    if (teachersWithoutProject > 0) {
      const result = await Teacher.updateMany(
        {
          $or: [
            { project: { $exists: false } },
            { project: null }
          ]
        },
        { $set: { project: tfetpProject._id } }
      );

      console.log(`✓ 遷移 ${result.modifiedCount} 位教師到 TFETP 專案`);
    } else {
      console.log('⚠️  所有教師已指派專案');
    }

    console.log('');
    console.log('🎉 遷移完成！');

  } catch (error) {
    console.error('❌ 遷移失敗:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

// 執行遷移
migrate();

export default migrate;

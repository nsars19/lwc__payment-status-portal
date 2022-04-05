public with sharing class CaseUtil {
  @AuraEnabled(cacheable=true)
  public static Id getRecordTypeId() {
    RecordType caseRecordType = [
      SELECT Id
      FROM RecordType
      WHERE Name = 'UITS Case'
      WITH SECURITY_ENFORCED
      LIMIT 1
    ];

    return caseRecordType.Id;
  }

  @AuraEnabled(cacheable=true)
  public static Id getCaseOwnerId() {
    Group caseOwner = [
      SELECT Id
      FROM Group
      WHERE Name = 'CRM and Digital Collaboration' AND Type = 'Queue'
      WITH SECURITY_ENFORCED
      LIMIT 1
    ];

    return caseOwner.Id;
  }

  @AuraEnabled(cacheable=true)
  public static Id getServiceId() {
    Services__c crmService = [
      SELECT Id
      FROM Services__c
      WHERE Name = 'CRM'
      WITH SECURITY_ENFORCED
      LIMIT 1
    ];

    return crmService.Id;
  }
}

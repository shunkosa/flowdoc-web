$(document).ready(function(){
    $.getJSON('/api/flows')
        .done((flowList, textStatus, jqXHR) => {
            const numOfAvailableFlows = flowList.filter(f => f.detail.processType === 'Workflow').length;
            const message = `<p class="slds-page-header__name-meta">${numOfAvailableFlows} of ${flowList.length} flows are available</p>`;
            $(".slds-media__body").append(message);

            let table = `<div class="slds-scrollable slds-grow slds-m-horizontal_medium slds-m-bottom_medium">
                          <div class="slds-scrollable_none">
                            <table aria-multiselectable="true" class="slds-table slds-no-row-hover slds-table_bordered slds-table_fixed-layout" role="grid">
                              <thead>
                                <tr class="slds-line-height_reset">
                                  <th class="" scope="col" style="width: 4rem; height: 2rem;">
                                    <div class="slds-truncate slds-assistive-text">Buttons</div>
                                  </th>
                                  <th class="" scope="col">
                                    <div class="slds-truncate">Name</div>
                                  </th>
                                  <th class="" scope="col">
                                    <div class="slds-truncate">API Name</div>
                                  </th>
                                  <th class="" scope="col">
                                    <div class="slds-truncate">Last Modified Date</div>
                                  </th>
                                  <th class="" scope="col">
                                    <div class="slds-truncate">Last Modified By</div>
                                  </th>
                                </tr>
                              </thead>
                            <tbody>`;
            for(const flow of flowList) {
              table += `<tr aria-selected="false" class="slds-hint-parent">
                            <td class="slds-text-align_right" role="gridcell" tabindex="0" >`;
            if (flow.detail.processType === 'Workflow') { 
              table += `<label class="slds-checkbox-button">
                          <input class="slds-assistive-text" type="checkbox" tabindex="-1">
                          <span class="slds-icon_container slds-icon-utility-download slds-current-color">
                            <svg class="slds-icon slds-icon_x-small" aria-hidden="true">
                              <use xlink:href="utility-symbols.svg#download"></use>
                            </svg>
                            <span class="slds-assistive-text">Download PDF</span>
                          </span>
                        </label>`;
            }
            table += `</td>
              <th scope="row"><div class="slds-truncate" style="line-height: 2rem;">${flow.detail.label}</div></th>
              <td role="gridcell"><div class="slds-truncate">${flow.fullName}</div></td>
              <td role="gridcell">${flow.formattedLastModifiedDate}</td>
              <td role="gridcell">${flow.lastModifiedByName}</td>
            </tr>`;
            }
            table += '</tbody></table></div></div>';
            $('body').append(table);
        })
        .fail((jqXHR, textStatus, errorThrown) => {
          $('body').append(`<div class="overlay">${jqXHR.status} ${textStatus}</div>`);
        })
        .always(() => {
          $("#loading_message").hide();
          $(".slds-spinner_container").hide();
        });
});